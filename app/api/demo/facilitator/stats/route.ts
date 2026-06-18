import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { DONNA_DRIVE_ENABLED } from '@/lib/donna-drive/constants'

export async function GET(request: NextRequest) {
  if (!DONNA_DRIVE_ENABLED) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  // Verify auth from authorization header or cookies
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Supabase not connected' }, { status: 500 })
  }

  try {
    // 1. Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 })
    }

    // 2. Check if user is admin by checking the 'role' column in public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, message: 'User record not found' }, { status: 403 })
    }

    // Check role column, or fallback to profile->role
    const role = userData.role || userData.profile?.role
    if (role !== 'admin' && role !== 'facilitator') {
      return NextResponse.json({ success: false, message: 'Access denied: User is not an admin' }, { status: 403 })
    }

    // 3. Fetch stats
    const orgId = 'dd-org-001' // Default demo org

    // Fetch total tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('donna_drive_tasks')
      .select('status, assigned_to')
      .eq('org_id', orgId)

    if (tasksError) throw tasksError

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
        progressByRole
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
