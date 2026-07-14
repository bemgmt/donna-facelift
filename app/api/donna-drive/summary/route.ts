import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { SCENARIOS } from '@/lib/donna-drive/scenarios'
import { authenticateDriveTaskRequest, DRIVE_ORG_ID, TaskAuthError } from '@/lib/donna-drive/task-auth'

let resendClient: Resend | null = null

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY)
  return resendClient
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, member, roleSlug } = await authenticateDriveTaskRequest(request)
    if (!member || !roleSlug) {
      return NextResponse.json({ success: false, message: 'An assigned attendee role is required.' }, { status: 403 })
    }

    const { data: attendee, error: attendeeError } = await supabase
      .from('donna_drive_members')
      .select('id, email, display_name')
      .eq('id', member.id)
      .eq('org_id', DRIVE_ORG_ID)
      .single()

    if (attendeeError || !attendee?.email) {
      return NextResponse.json({ success: false, message: 'Your registration email was not found.' }, { status: 404 })
    }

    const [orgResult, taskResult, chatResult] = await Promise.all([
      supabase.from('donna_drive_organizations').select('property_name, status').eq('id', DRIVE_ORG_ID).maybeSingle(),
      supabase.from('donna_drive_tasks').select('title, status').eq('org_id', DRIVE_ORG_ID).eq('assigned_to', roleSlug).order('updated_at', { ascending: false }),
      supabase.from('donna_drive_facilitator_chats').select('message').eq('org_id', DRIVE_ORG_ID).eq('member_id', member.id).order('created_at', { ascending: true }),
    ])

    const queryError = orgResult.error || taskResult.error || chatResult.error
    if (queryError) throw queryError
    if (orgResult.data?.status !== 'completed') {
      return NextResponse.json({ success: false, message: 'The event has not ended yet.' }, { status: 409 })
    }

    const scenario = SCENARIOS.find((item) => item.name === orgResult.data?.property_name) || SCENARIOS[0]
    const role = scenario.roles.find((item) => item.id === roleSlug)
    const tasks = taskResult.data || []
    const completedTasks = tasks.filter((task) => task.status === 'completed')
    const taskLines = tasks.length
      ? tasks.map((task) => `<li><strong>${escapeHtml(task.title)}</strong> - ${escapeHtml(task.status.replaceAll('_', ' '))}</li>`).join('')
      : '<li>No role tasks were recorded.</li>'
    const chats = chatResult.data || []
    const interactionLines = chats.length
      ? chats.slice(-8).map((chat) => `<li>${escapeHtml(chat.message)}</li>`).join('')
      : '<li>No DONNA or DIN interactions were recorded.</li>'

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #20242c; line-height: 1.55;">
        <h2>Your DONNA Drive event breakdown</h2>
        <p>Hi ${escapeHtml(attendee.display_name || 'Attendee')},</p>
        <p>Thanks for joining the DONNA Drive event.</p>
        <p><strong>Scenario:</strong> ${escapeHtml(scenario.name)}<br />
        <strong>Your role:</strong> ${escapeHtml(role?.title || roleSlug)}<br />
        <strong>Progress:</strong> ${completedTasks.length} of ${tasks.length} assigned tasks completed</p>
        <h3>Your task breakdown</h3><ul>${taskLines}</ul>
        <h3>Recent DONNA and DIN activity</h3><ul>${interactionLines}</ul>
        <p>Thank you for participating.</p>
        <p>- DONNA<br />Digital Operations Neural Network Assistant</p>
      </div>`

    const resend = getResend()
    if (!resend) {
      console.info('[DONNA Drive] Summary requested without RESEND_API_KEY', { memberId: member.id })
      return NextResponse.json({ success: false, message: 'Event email delivery is not configured.' }, { status: 503 })
    }

    const { error: emailError } = await resend.emails.send({
      from: 'DONNA Drive <donna@askdonna.com>',
      to: attendee.email,
      subject: 'Your DONNA Drive event breakdown',
      html: emailHtml,
    })
    if (emailError) throw emailError

    return NextResponse.json({ success: true, message: 'Your event breakdown was sent to your registration email.' })
  } catch (error) {
    if (error instanceof TaskAuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error('[DONNA Drive] Summary API error:', error)
    return NextResponse.json({ success: false, message: 'Your event breakdown could not be sent.' }, { status: 500 })
  }
}
