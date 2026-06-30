/**
 * POST /api/demo/event
 *
 * Injects a scenario event into the demo organization.
 * Called by the facilitator panel during a DONNA Drive session.
 *
 * Body: { facilitator_secret, event_type, org_id }
 * Returns: { success, emails_created, tasks_created, notifications_created }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  isDonnaDriveEnabled,
  DEMO_EVENTS,
} from '@/lib/donna-drive/constants'
import { getEventPayload } from '@/lib/donna-drive/event-payloads'
import { authorizeDriveFacilitator } from '@/lib/donna-drive/auth'
import type { InjectEventRequest, InjectEventResponse, DemoEventType } from '@/lib/donna-drive/types'

const VALID_EVENT_TYPES = DEMO_EVENTS.map((e) => e.type)

export async function POST(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  let body: InjectEventRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin() ?? null

  const authorization = await authorizeDriveFacilitator(request, supabase, body)
  if (!authorization.authorized) {
    return NextResponse.json(
      { success: false, message: authorization.message },
      { status: authorization.status }
    )
  }

  if (!VALID_EVENT_TYPES.includes(body.event_type as DemoEventType)) {
    return NextResponse.json(
      { success: false, message: `Invalid event_type. Valid: ${VALID_EVENT_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  const payload = getEventPayload(body.event_type)

  // Removed duplicate const supabase declaration
  if (!supabase) {
    // Preview mode — return the payload without persisting
    return NextResponse.json({
      success: true,
      emails_created: payload.emails.length,
      tasks_created: payload.tasks.length,
      notifications_created: payload.notifications.length,
      _preview: true,
      _payload: payload,
    } satisfies InjectEventResponse & { _preview: boolean; _payload: typeof payload })
  }

  try {
    // Insert emails
    if (payload.emails.length > 0) {
      const { error } = await supabase
        .from('donna_drive_emails')
        .insert(payload.emails)
      if (error) throw error
    }

    // Insert tasks
    if (payload.tasks.length > 0) {
      const { error } = await supabase
        .from('donna_drive_tasks')
        .insert(payload.tasks)
      if (error) throw error
    }

    // Insert notifications
    if (payload.notifications.length > 0) {
      const { error } = await supabase
        .from('donna_drive_notifications')
        .insert(payload.notifications)
      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      emails_created: payload.emails.length,
      tasks_created: payload.tasks.length,
      notifications_created: payload.notifications.length,
    } satisfies InjectEventResponse)
  } catch (error) {
    console.error('[DONNA Drive] Event injection error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to inject event', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/demo/event
 *
 * Returns the list of available scenario events (public, no auth needed).
 */
export async function GET() {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    success: true,
    events: DEMO_EVENTS,
  })
}
