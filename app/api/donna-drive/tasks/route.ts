import { NextRequest, NextResponse } from 'next/server'
import { authenticateDriveTaskRequest, DRIVE_ORG_ID, TaskAuthError } from '@/lib/donna-drive/task-auth'
import type { DriveTaskAction, DriveTaskRecord } from '@/lib/donna-drive/task-engine'

export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
  if (error instanceof TaskAuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.status })
  console.error('[DONNA Drive] Task engine error:', error)
  return NextResponse.json({ success: false, message: 'The task engine could not complete this request.' }, { status: 500 })
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, facilitator, member, roleSlug } = await authenticateDriveTaskRequest(request)
    const { data, error } = await supabase
      .from('donna_drive_tasks')
      .select('*')
      .eq('org_id', DRIVE_ORG_ID)
      .order('due_date', { ascending: true })

    if (error) throw error
    const tasks = (data || []) as DriveTaskRecord[]
    const completedIds = new Set(tasks.filter((task) => task.status === 'completed').map((task) => task.id))
    const roleAssigned = Boolean(roleSlug)

    return NextResponse.json({
      success: true,
      member: member ? { id: member.id, role_slug: roleSlug } : null,
      tasks: tasks.map((task) => ({
        ...task,
        can_act: facilitator || (roleAssigned && task.assigned_to === roleSlug),
        dependencies_complete: (task.dependency_task_ids || []).every((id) => completedIds.has(id)),
      })),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, facilitator, member, roleSlug } = await authenticateDriveTaskRequest(request)
    const body = await request.json() as { task_id?: string; action?: DriveTaskAction; note?: string; idempotency_key?: string }
    const action = body.action
    if (!body.task_id || !action || !['start', 'block', 'complete', 'reopen'].includes(action)) {
      return NextResponse.json({ success: false, message: 'A valid task and action are required.' }, { status: 400 })
    }

    const { data: task, error: taskError } = await supabase
      .from('donna_drive_tasks')
      .select('id, assigned_to')
      .eq('org_id', DRIVE_ORG_ID)
      .eq('id', body.task_id)
      .maybeSingle()
    if (taskError) throw taskError
    if (!task) return NextResponse.json({ success: false, message: 'Task not found.' }, { status: 404 })
    if (!facilitator && (!roleSlug || task.assigned_to !== roleSlug)) {
      return NextResponse.json({ success: false, message: 'This task belongs to another event role.' }, { status: 403 })
    }
    if ((action === 'block' || action === 'complete') && !body.note?.trim()) {
      return NextResponse.json({ success: false, message: action === 'complete' ? 'Add the requested completion evidence before finishing this task.' : 'Explain what is blocking the task.' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('donna_drive_apply_task_action', {
      p_task_id: body.task_id,
      p_member_id: member?.id || null,
      p_action: action,
      p_note: body.note?.trim() || null,
      p_idempotency_key: body.idempotency_key || crypto.randomUUID(),
    })
    if (error) {
      const message = error.message.includes('dependencies') ? 'Complete the required dependency before starting or finishing this task.' : error.message
      return NextResponse.json({ success: false, message }, { status: 409 })
    }

    return NextResponse.json({ success: true, task: data })
  } catch (error) {
    return errorResponse(error)
  }
}
