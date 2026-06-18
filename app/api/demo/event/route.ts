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
  FACILITATOR_SECRET,
  DONNA_DRIVE_ENABLED,
  DEMO_EVENTS,
} from '@/lib/donna-drive/constants'
import { getEventPayload } from '@/lib/donna-drive/event-payloads'
import type { InjectEventRequest, InjectEventResponse, DemoEventType } from '@/lib/donna-drive/types'

const VALID_EVENT_TYPES = DEMO_EVENTS.map((e) => e.type)

export async function POST(request: NextRequest) {
  if (!DONNA_DRIVE_ENABLED) {
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

  const supabase = getSupabaseAdmin()

  // Verify auth: check facilitator_secret OR an admin Supabase session
  let isAuthorized = false
  if (body.facilitator_secret === FACILITATOR_SECRET) {
    isAuthorized = true
  } else if (supabase) {
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('profile')
          .eq('email', user.email)
          .single()

        if (userError || !userData) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              email: user.email,
              name: user.email?.split('@')[0] || 'Demo User',
              profile: { role: 'facilitator' }
            })
            .select('profile')
            .single()

          if (!insertError && newUser) {
            userData = newUser
          }
        }
        
        const role = userData?.profile?.role
        if (role === 'admin' || role === 'facilitator') {
          isAuthorized = true
        }
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Invalid facilitator secret or admin session' },
      { status: 401 }
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
  if (!DONNA_DRIVE_ENABLED) {
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
