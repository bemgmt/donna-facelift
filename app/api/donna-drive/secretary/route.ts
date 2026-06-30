import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SCENARIOS } from '@/lib/donna-drive/scenarios'

export async function POST(req: NextRequest) {
  try {
    const { message, roleId } = await req.json()
    if (!message || !roleId) {
      return NextResponse.json({ success: false, message: 'message and roleId are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 })
    }

    const { data: orgData } = await supabase
      .from('donna_drive_organizations')
      .select('*')
      .eq('status', 'live')
      .maybeSingle()

    if (!orgData) {
      return NextResponse.json({ success: false, message: 'No active live event found.' }, { status: 400 })
    }

    const scenario = SCENARIOS.find((s) => s.name === orgData.property_name)
    if (!scenario) {
      return NextResponse.json({ success: false, message: 'Scenario context not found' }, { status: 404 })
    }

    const roleDef = scenario.roles.find((role) => role.id === roleId)
    const firstTask = scenario.tasks.find((task) => task.ownerRoleId === roleId)
    const firstInbox = scenario.inbox.find((item) => item.toRoleId === roleId)
    const otherRoles = scenario.roles
      .filter((role) => role.id !== roleId)
      .slice(0, 4)
      .map((role) => `- ${role.title}: ${role.primaryObjective}`)
      .join('\n')

    const reply = [
      `Scenario: ${scenario.name}`,
      `Role: ${roleDef ? roleDef.title : roleId}`,
      roleDef?.secretaryOverlay ? `Guidance: ${roleDef.secretaryOverlay}` : null,
      firstTask ? `Next task: ${firstTask.title}.` : 'No open tasks are currently assigned to your role.',
      firstInbox ? `Priority inbox item: ${firstInbox.subject} - ${firstInbox.summary}` : null,
      otherRoles ? `DIN options:\n${otherRoles}` : null,
      `Your message was recorded: "${message}"`,
    ]
      .filter(Boolean)
      .join('\n\n')

    await supabase.from('donna_drive_facilitator_chats').insert({
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: orgData.id,
      member_id: roleId,
      sender: 'secretary',
      message: `[Participant: ${message}] -> [Donna: ${reply}]`,
    })

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    console.error('Secretary API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
