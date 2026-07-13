-- Canonical DONNA Drive task engine for the Vernon pilot scenario.
alter table public.donna_drive_tasks
  add column if not exists scenario_task_id varchar,
  add column if not exists instructions jsonb not null default '[]'::jsonb,
  add column if not exists required_inputs jsonb not null default '[]'::jsonb,
  add column if not exists completion_criteria jsonb not null default '[]'::jsonb,
  add column if not exists evidence_requirements jsonb not null default '[]'::jsonb,
  add column if not exists action_config jsonb not null default '{}'::jsonb,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by_member_id varchar references public.donna_drive_members(id) on delete set null,
  add column if not exists blocked_reason text,
  add column if not exists version integer not null default 1,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.donna_drive_task_events (
  id uuid primary key default gen_random_uuid(),
  org_id varchar not null,
  task_id varchar not null references public.donna_drive_tasks(id) on delete cascade,
  member_id varchar references public.donna_drive_members(id) on delete set null,
  event_type varchar not null,
  from_status varchar,
  to_status varchar,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key varchar,
  created_at timestamptz not null default now(),
  constraint donna_drive_task_events_idempotency unique (task_id, idempotency_key)
);

create table if not exists public.donna_drive_task_evidence (
  id uuid primary key default gen_random_uuid(),
  org_id varchar not null,
  task_id varchar not null references public.donna_drive_tasks(id) on delete cascade,
  member_id varchar references public.donna_drive_members(id) on delete set null,
  evidence_type varchar not null default 'note',
  label varchar not null,
  value text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists donna_drive_tasks_org_role_idx
  on public.donna_drive_tasks (org_id, assigned_to, status);
create unique index if not exists donna_drive_tasks_org_scenario_task_idx
  on public.donna_drive_tasks (org_id, scenario_task_id)
  where scenario_task_id is not null;
create index if not exists donna_drive_task_events_org_task_idx
  on public.donna_drive_task_events (org_id, task_id, created_at desc);
create index if not exists donna_drive_task_evidence_org_task_idx
  on public.donna_drive_task_evidence (org_id, task_id, created_at desc);
create index if not exists donna_drive_members_user_org_idx
  on public.donna_drive_members (user_id, org_id);

alter table public.donna_drive_tasks enable row level security;
alter table public.donna_drive_task_events enable row level security;
alter table public.donna_drive_task_evidence enable row level security;

drop policy if exists "Drive members can read event tasks" on public.donna_drive_tasks;
create policy "Drive members can read event tasks"
  on public.donna_drive_tasks for select to authenticated
  using (exists (
    select 1 from public.donna_drive_members member
    where member.org_id = donna_drive_tasks.org_id
      and member.user_id = (select auth.uid())
  ));

drop policy if exists "Drive members can read task events" on public.donna_drive_task_events;
create policy "Drive members can read task events"
  on public.donna_drive_task_events for select to authenticated
  using (exists (
    select 1 from public.donna_drive_members member
    where member.org_id = donna_drive_task_events.org_id
      and member.user_id = (select auth.uid())
  ));

drop policy if exists "Drive members can read task evidence" on public.donna_drive_task_evidence;
create policy "Drive members can read task evidence"
  on public.donna_drive_task_evidence for select to authenticated
  using (exists (
    select 1 from public.donna_drive_members member
    where member.org_id = donna_drive_task_evidence.org_id
      and member.user_id = (select auth.uid())
  ));

grant select on public.donna_drive_tasks, public.donna_drive_task_events, public.donna_drive_task_evidence to authenticated;

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
begin
  select * into current_task from public.donna_drive_tasks where id = p_task_id for update;
  if not found then raise exception 'task_not_found'; end if;

  if p_idempotency_key is not null then
    select id into prior_event_id from public.donna_drive_task_events
      where task_id = p_task_id and idempotency_key = p_idempotency_key;
    if prior_event_id is not null then return to_jsonb(current_task); end if;
  end if;

  if p_action in ('start', 'complete') and exists (
    select 1 from jsonb_array_elements_text(coalesce(current_task.dependency_task_ids, '[]'::jsonb)) dependency(id)
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
  if p_action = 'complete' then
    insert into public.donna_drive_task_evidence (org_id, task_id, member_id, evidence_type, label, value)
    values (current_task.org_id, current_task.id, p_member_id, 'note',
      coalesce(current_task.evidence_requirements->>0, 'Completion evidence'), btrim(p_note));
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

  insert into public.donna_drive_task_events
    (org_id, task_id, member_id, event_type, from_status, to_status, payload, idempotency_key)
  values
    (current_task.org_id, current_task.id, p_member_id, p_action, previous_status, next_status,
      jsonb_build_object('note', p_note), p_idempotency_key);

  return to_jsonb(current_task);
end;
$$;

revoke all on function public.donna_drive_apply_task_action(varchar, varchar, varchar, text, varchar) from public, anon, authenticated;
grant execute on function public.donna_drive_apply_task_action(varchar, varchar, varchar, text, varchar) to service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'donna_drive_tasks'
  ) then
    alter publication supabase_realtime add table public.donna_drive_tasks;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'donna_drive_task_events'
  ) then
    alter publication supabase_realtime add table public.donna_drive_task_events;
  end if;
end $$;
