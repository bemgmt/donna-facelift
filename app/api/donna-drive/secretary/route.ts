import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SCENARIOS } from '@/lib/donna-drive/scenarios'
import { authenticateDriveTaskRequest, DRIVE_ORG_ID, TaskAuthError } from '@/lib/donna-drive/task-auth'

let openAIClient: OpenAI | null = null

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null
  if (!openAIClient) openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openAIClient
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json() as { message?: string }
    if (!message?.trim()) return NextResponse.json({ success: false, message: 'Enter a question for DONNA.' }, { status: 400 })

    const { supabase, member, roleSlug } = await authenticateDriveTaskRequest(request)
    if (!member || !roleSlug) return NextResponse.json({ success: false, message: 'An assigned attendee role is required.' }, { status: 403 })

    const { data: orgData } = await supabase
      .from('donna_drive_organizations')
      .select('id, property_name')
      .eq('id', DRIVE_ORG_ID)
      .eq('status', 'live')
      .maybeSingle()
    if (!orgData) return NextResponse.json({ success: false, message: 'No active live event found.' }, { status: 400 })

    const scenario = SCENARIOS.find((item) => item.name === orgData.property_name) || SCENARIOS[0]
    const role = scenario.roles.find((item) => item.id === roleSlug)
    const [taskResult, notificationResult, emailResult] = await Promise.all([
      supabase.from('donna_drive_tasks').select('id, scenario_task_id, title, status, priority, due_date, dependency_task_ids, instructions, completion_criteria, blocked_reason').eq('org_id', orgData.id).eq('assigned_to', roleSlug).order('due_date', { ascending: true }),
      supabase.from('donna_drive_notifications').select('title, body, type, created_at').eq('org_id', orgData.id).eq('target_role', roleSlug).eq('read', false).order('created_at', { ascending: false }).limit(10),
      supabase.from('donna_drive_emails').select('from_role, subject, body, created_at').eq('org_id', orgData.id).eq('to_role', roleSlug).eq('read', false).order('created_at', { ascending: false }).limit(10),
    ])
    const contextError = taskResult.error || notificationResult.error || emailResult.error
    if (contextError) throw contextError

    const tasks = taskResult.data || []
    const notifications = notificationResult.data || []
    const emails = emailResult.data || []
    const nextTask = tasks.find((task) => task.status !== 'completed' && task.status !== 'waiting')
    const blockedTasks = tasks.filter((task) => task.status === 'blocked' || task.status === 'waiting')
    const taskContext = tasks.map((task, index) => {
      const steps = Array.isArray(task.instructions) ? task.instructions.join(' | ') : 'Open the Tasks module for instructions.'
      return `${index + 1}. [${String(task.status).toUpperCase()}] ${task.scenario_task_id || task.id}: ${task.title}; steps: ${steps}${task.blocked_reason ? `; blocker: ${task.blocked_reason}` : ''}`
    }).join('\n')
    const signalContext = [
      ...notifications.map((item) => `[${item.type}] ${item.title}: ${item.body}`),
      ...emails.map((item) => `[email from ${item.from_role}] ${item.subject}: ${item.body}`),
    ].join('\n')

    const fallbackReply = nextTask
      ? `Your next actionable task is ${nextTask.scenario_task_id || nextTask.id}: ${nextTask.title}. Open Tasks for the required inputs and completion evidence.${blockedTasks.length ? ` You also have ${blockedTasks.length} blocked or dependency-waiting item(s).` : ''}`
      : blockedTasks.length
        ? `Your remaining work is blocked or waiting on dependencies. Open Tasks to review the named blocker and use DIN to contact the responsible role.`
        : `Your assigned tasks are complete. Review Transaction Room evidence and new DIN notifications for follow-up.`

    let reply = fallbackReply
    const openai = getOpenAI()
    if (openai) {
      const prompt = `You are DONNA Secretary inside a live commercial real estate transaction simulation.
Use only the live state below. Give one clear next action first, then concise supporting detail. Never claim you changed task state; attendees must submit actions and evidence in the Tasks module.

Scenario: ${scenario.name}
Role: ${role?.title || roleSlug}
Role objective: ${role?.primaryObjective || 'Coordinate assigned transaction work.'}

LIVE TASKS:
${taskContext || 'No tasks assigned.'}

NEW HANDOFFS, NOTIFICATIONS, AND EMAILS:
${signalContext || 'No new signals.'}`
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: message.trim() }],
        temperature: 0.3,
        max_tokens: 450,
      })
      reply = response.choices[0]?.message?.content || fallbackReply
    }

    const { error: logError } = await supabase.from('donna_drive_facilitator_chats').insert({
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: orgData.id,
      member_id: member.id,
      sender: 'attendee',
      message: `[Secretary] ${message.trim()} -> ${reply}`,
    })
    if (logError) console.error('[DONNA Drive] Secretary log error:', logError.message)

    return NextResponse.json({ success: true, reply, source: openai ? 'live-task-ai' : 'live-task-deterministic' })
  } catch (error) {
    if (error instanceof TaskAuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    console.error('[DONNA Drive] Secretary API error:', error)
    return NextResponse.json({ success: false, message: 'DONNA Secretary could not process that request.' }, { status: 500 })
  }
}