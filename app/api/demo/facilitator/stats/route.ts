import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isDonnaDriveEnabled } from '@/lib/donna-drive/constants'
import { isFacilitatorRequestAuthorized } from '@/lib/donna-drive/facilitator-auth'

export async function GET(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  if (!(await isFacilitatorRequestAuthorized(request))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Supabase not connected' }, { status: 500 })
  }

  try {
    // Fetch stats
    const orgId = 'dd-org-001' // Default demo org

    // Fetch total tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('donna_drive_tasks')
      .select('id, scenario_task_id, title, status, assigned_to, blocked_reason, updated_at')
      .eq('org_id', orgId)

    if (tasksError) throw tasksError

    const { data: recentActivity, error: activityError } = await supabase
      .from('donna_drive_task_events')
      .select('id, task_id, event_type, from_status, to_status, payload, created_at, donna_drive_tasks(title, scenario_task_id, assigned_to)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(12)

    if (activityError) throw activityError

    // Fetch assigned members
    // Fallback: If donna_drive_members doesn't exist, we just query contacts with roles.
    // The previous implementation used contacts to seed.
    const { data: contacts, error: contactsError } = await supabase
      .from('donna_drive_contacts')
      .select('role_slug')
      .eq('org_id', orgId)

    if (contactsError) throw contactsError

    // Aggregate stats
    const totalUsersInQueue = contacts.length
    
    const progressByRole: Record<string, { total: number, completed: number }> = {}
    
    if (tasks) {
      tasks.forEach(task => {
        if (!progressByRole[task.assigned_to]) {
          progressByRole[task.assigned_to] = { total: 0, completed: 0 }
        }
        progressByRole[task.assigned_to].total += 1
        if (task.status === 'completed') {
          progressByRole[task.assigned_to].completed += 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsersInQueue,
        progressByRole,
        blockedTasks: (tasks || []).filter(task => task.status === 'blocked'),
        recentActivity: recentActivity || []
      }
    })

  } catch (error: any) {
    console.error('[DONNA Drive] Stats fetch error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
