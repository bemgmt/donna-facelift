-- Deterministic, atomic ecosystem effects for DONNA Drive task actions.
update public.donna_drive_tasks
set action_config = jsonb_set(
  coalesce(action_config, '{}'::jsonb),
  '{completion_effects}',
  case scenario_task_id
    when 'VCC-01' then jsonb_build_object('document_name', 'VCC_Title_Objection_Summary.txt', 'notify_roles', jsonb_build_array('vcc-acq-manager', 'vcc-surveyor', 'vcc-title-officer'))
    when 'VCC-02' then jsonb_build_object('document_name', 'VCC_Survey_Field_Status.txt', 'notify_roles', jsonb_build_array('vcc-acq-manager', 'vcc-counsel', 'vcc-title-officer'))
    when 'VCC-03' then jsonb_build_object('document_name', 'VCC_Phase_I_User_Questionnaire.txt', 'notify_roles', jsonb_build_array('vcc-env'))
    when 'VCC-04' then jsonb_build_object('document_name', 'VCC_Top_Tenant_Estoppel_Status.txt', 'notify_roles', jsonb_build_array('vcc-acq-manager', 'vcc-underwriter'))
    when 'VCC-05' then jsonb_build_object('document_name', 'VCC_Lender_Operating_Package_Delivery.txt', 'notify_roles', jsonb_build_array('vcc-underwriter'), 'email_to_role', 'vcc-underwriter', 'email_subject', 'Updated T-12, YTD, and AR aging delivered')
    else '{}'::jsonb
  end,
  true
)
where scenario_task_id in ('VCC-01', 'VCC-02', 'VCC-03', 'VCC-04', 'VCC-05');
create or replace function public.donna_drive_apply_task_action(
  p_task_id varchar,
  p_member_id varchar,
  p_action varchar,
  p_note text default null,
  p_idempotency_key varchar default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_task public.donna_drive_tasks%rowtype;
  previous_status varchar;
  next_status varchar;
  prior_event_id uuid;
  effect_config jsonb;
  notification_role text;
  dependent_task record;
  document_name text;
  email_to_role text;
  calendar_id text;
  document_id text;
  effect_key text;
begin
  select * into current_task from public.donna_drive_tasks where id = p_task_id for update;
  if not found then raise exception 'task_not_found'; end if;

  if p_idempotency_key is not null then
    select id into prior_event_id from public.donna_drive_task_events
      where task_id = p_task_id and idempotency_key = p_idempotency_key;
    if prior_event_id is not null then return to_jsonb(current_task); end if;
  end if;

  if p_action in ('start', 'complete') and exists (
    select 1
    from jsonb_array_elements_text(coalesce(current_task.dependency_task_ids, '[]'::jsonb)) dependency(id)
    left join public.donna_drive_tasks dependency_task on dependency_task.id = dependency.id
    where dependency_task.status is distinct from 'completed'
  ) then
    raise exception 'task_dependencies_incomplete';
  end if;

  next_status := case p_action
    when 'start' then 'in_progress'
    when 'block' then 'blocked'
    when 'complete' then 'completed'
    when 'reopen' then 'in_progress'
    else null
  end;
  if next_status is null then raise exception 'invalid_task_action'; end if;
  if p_action in ('block', 'complete') and coalesce(btrim(p_note), '') = '' then
    raise exception 'task_note_required';
  end if;

  previous_status := current_task.status;
  effect_config := coalesce(current_task.action_config->'completion_effects', '{}'::jsonb);
  effect_key := md5(current_task.id || ':' || p_action || ':' || coalesce(p_idempotency_key, now()::text));
  calendar_id := 'task-calendar-' || md5(current_task.id);
  document_id := 'task-evidence-' || md5(current_task.id);
  document_name := effect_config->>'document_name';
  email_to_role := effect_config->>'email_to_role';

  if p_action = 'complete' then
    insert into public.donna_drive_task_evidence (org_id, task_id, member_id, evidence_type, label, value)
    values (
      current_task.org_id,
      current_task.id,
      p_member_id,
      'note',
      coalesce(current_task.evidence_requirements->>0, 'Completion evidence'),
      btrim(p_note)
    );
  end if;

  update public.donna_drive_tasks set
    status = next_status,
    started_at = case when p_action in ('start', 'reopen') then coalesce(started_at, now()) else started_at end,
    completed_at = case when p_action = 'complete' then now() when p_action = 'reopen' then null else completed_at end,
    completed_by_member_id = case when p_action = 'complete' then p_member_id when p_action = 'reopen' then null else completed_by_member_id end,
    blocked_reason = case when p_action = 'block' then btrim(p_note) when p_action in ('start', 'complete', 'reopen') then null else blocked_reason end,
    version = version + 1,
    updated_at = now()
  where id = current_task.id
  returning * into current_task;

  insert into public.donna_drive_calendar_events
    (id, org_id, title, description, start_time, end_time, location, attendees, created_at)
  values (
    calendar_id,
    current_task.org_id,
    case p_action
      when 'complete' then 'Completed: ' || current_task.title
      when 'block' then 'Blocked: ' || current_task.title
      else 'In progress: ' || current_task.title
    end,
    coalesce(nullif(btrim(p_note), ''), current_task.description, 'Task activity recorded by DONNA Drive.'),
    coalesce(current_task.started_at, now()),
    case when p_action = 'complete' then now() else coalesce(current_task.due_date, now() + interval '1 hour') end,
    'DONNA Drive / Tasks',
    jsonb_build_array(current_task.assigned_to),
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    attendees = excluded.attendees;

  insert into public.donna_drive_notifications
    (id, org_id, target_role, title, body, type, read, created_at)
  values (
    'task-effect-' || effect_key,
    current_task.org_id,
    current_task.assigned_to,
    case p_action
      when 'complete' then 'Task completed'
      when 'block' then 'Task blocker recorded'
      when 'reopen' then 'Task reopened'
      else 'Task started'
    end,
    current_task.title || case when coalesce(btrim(p_note), '') = '' then '' else ': ' || btrim(p_note) end,
    case when p_action = 'block' then 'action_required' when p_action = 'complete' then 'info' else 'warning' end,
    false,
    now()
  ) on conflict (id) do nothing;

  if p_action = 'complete' then
    if coalesce(document_name, '') <> '' then
      insert into public.donna_drive_documents
        (id, org_id, name, type, size_kb, uploaded_by, status, version, version_history, created_at)
      values (
        document_id,
        current_task.org_id,
        document_name,
        'txt',
        1,
        current_task.assigned_to,
        'approved',
        current_task.version::text,
        jsonb_build_array(jsonb_build_object(
          'version', current_task.version::text,
          'uploaded_by', current_task.assigned_to,
          'uploaded_at', now(),
          'evidence', p_note,
          'task_id', current_task.scenario_task_id
        )),
        now()
      )
      on conflict (id) do update set
        status = 'approved',
        version = excluded.version,
        version_history = coalesce(donna_drive_documents.version_history, '[]'::jsonb) || excluded.version_history;
    end if;

    for notification_role in
      select jsonb_array_elements_text(coalesce(effect_config->'notify_roles', '[]'::jsonb))
    loop
      insert into public.donna_drive_notifications
        (id, org_id, target_role, title, body, type, read, created_at)
      values (
        'task-handoff-' || md5(current_task.id || ':' || notification_role || ':' || coalesce(p_idempotency_key, '')),
        current_task.org_id,
        notification_role,
        'Deliverable ready: ' || current_task.title,
        coalesce(nullif(btrim(p_note), ''), 'The upstream task is complete. Review the new evidence in the Transaction Room.'),
        'action_required',
        false,
        now()
      ) on conflict (id) do nothing;
    end loop;

    for dependent_task in
      select id, assigned_to, title
      from public.donna_drive_tasks
      where org_id = current_task.org_id
        and coalesce(dependency_task_ids, '[]'::jsonb) ? current_task.id
    loop
      update public.donna_drive_tasks
      set status = case when status = 'waiting' then 'pending' else status end,
          updated_at = now(),
          version = version + 1
      where id = dependent_task.id;

      insert into public.donna_drive_notifications
        (id, org_id, target_role, title, body, type, read, created_at)
      values (
        'task-unlock-' || md5(current_task.id || ':' || dependent_task.id || ':' || coalesce(p_idempotency_key, '')),
        current_task.org_id,
        dependent_task.assigned_to,
        'Task unlocked: ' || dependent_task.title,
        current_task.title || ' is complete. You can begin your dependent task now.',
        'action_required',
        false,
        now()
      ) on conflict (id) do nothing;
    end loop;

    if coalesce(email_to_role, '') <> '' then
      insert into public.donna_drive_emails
        (id, org_id, from_role, to_role, subject, body, read, starred, thread_id, created_at)
      values (
        'task-email-' || md5(current_task.id || ':' || email_to_role || ':' || coalesce(p_idempotency_key, '')),
        current_task.org_id,
        current_task.assigned_to,
        email_to_role,
        coalesce(effect_config->>'email_subject', 'Completed deliverable: ' || current_task.title),
        btrim(p_note),
        false,
        false,
        coalesce(current_task.scenario_task_id, current_task.id),
        now()
      ) on conflict (id) do nothing;
    end if;
  elsif p_action = 'reopen' then
    update public.donna_drive_documents set status = 'pending_review' where id = document_id;
  end if;

  insert into public.donna_drive_task_events
    (org_id, task_id, member_id, event_type, from_status, to_status, payload, idempotency_key)
  values (
    current_task.org_id,
    current_task.id,
    p_member_id,
    p_action,
    previous_status,
    next_status,
    jsonb_build_object(
      'note', p_note,
      'side_effects', jsonb_build_object(
        'calendar_event_id', calendar_id,
        'document_id', case when p_action = 'complete' and coalesce(document_name, '') <> '' then document_id else null end,
        'email_to_role', case when p_action = 'complete' then email_to_role else null end,
        'notify_roles', case when p_action = 'complete' then coalesce(effect_config->'notify_roles', '[]'::jsonb) else '[]'::jsonb end
      )
    ),
    p_idempotency_key
  );

  return to_jsonb(current_task) || jsonb_build_object(
    'effects', jsonb_build_object('calendar_event_id', calendar_id, 'document_id', document_id)
  );
end;
$$;

revoke all on function public.donna_drive_apply_task_action(varchar, varchar, varchar, text, varchar) from public, anon, authenticated;
grant execute on function public.donna_drive_apply_task_action(varchar, varchar, varchar, text, varchar) to service_role;
