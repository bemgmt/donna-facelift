/**
 * GET /api/demo/data
 *
 * Returns all demo data for a given role within an organization.
 * Used by the DONNA Drive dashboard to populate the UI.
 *
 * Query params: org_id, role (slug)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isDonnaDriveEnabled, DEMO_ROLES } from '@/lib/donna-drive/constants'
import { DEMO_SEED_DATA } from '@/lib/donna-drive/seed-data'
import { generateDemoSeedData, ScenarioKey } from '@/lib/donna-drive/seed-generator'
import type { DemoRoleSlug } from '@/lib/donna-drive/types'

export async function GET(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('org_id') || DEMO_SEED_DATA.org_id
  const scenarioKey = (searchParams.get('scenario') as ScenarioKey) || 'vernon'
  const roleSlug = searchParams.get('role') as DemoRoleSlug | null

  if (!roleSlug || !DEMO_ROLES.find((r) => r.slug === roleSlug)) {
    return NextResponse.json(
      { success: false, message: 'Valid role query parameter required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  // ------------------------------------------------------------------
  // If Supabase is not connected, return filtered static seed data
  // ------------------------------------------------------------------
  if (!supabase) {
    const seedData = generateDemoSeedData(scenarioKey, orgId)
    const { contacts, emails, tasks, documents, calendar_events, notifications, din_bid_requests, din_bid_responses } = seedData

    return NextResponse.json({
      success: true,
      _preview: true,
      role: DEMO_ROLES.find((r) => r.slug === roleSlug),
      contacts: contacts.filter((c) => c.role_slug === roleSlug || c.org_id === orgId),
      emails: emails.filter(
        (e) => e.from_role === roleSlug || e.to_role === roleSlug
      ),
      tasks: tasks.filter((t) => t.assigned_to === roleSlug),
      documents,
      calendar_events: calendar_events.filter(
        (ce) => ce.attendees.includes(roleSlug)
      ),
      notifications: notifications.filter((n) => n.target_role === roleSlug),
      din_bid_requests: din_bid_requests.filter(
        (r) => r.requested_by === roleSlug || r.org_id === orgId
      ),
      din_bid_responses: din_bid_responses.filter(
        (r) => r.vendor_role === roleSlug || r.org_id === orgId
      ),
    })
  }

  // ------------------------------------------------------------------
  // Live Supabase queries
  // ------------------------------------------------------------------
  try {
    const [contactsRes, emailsRes, tasksRes, docsRes, calRes, notifRes, dinReqRes, dinResRes] =
      await Promise.all([
        supabase
          .from('donna_drive_contacts')
          .select('*')
          .eq('org_id', orgId),
        supabase
          .from('donna_drive_emails')
          .select('*')
          .eq('org_id', orgId)
          .or(`from_role.eq.${roleSlug},to_role.eq.${roleSlug}`)
          .order('created_at', { ascending: false }),
        supabase
          .from('donna_drive_tasks')
          .select('*')
          .eq('org_id', orgId)
          .eq('assigned_to', roleSlug)
          .order('due_date', { ascending: true }),
        supabase
          .from('donna_drive_documents')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('donna_drive_calendar_events')
          .select('*')
          .eq('org_id', orgId)
          .contains('attendees', [roleSlug])
          .order('start_time', { ascending: true }),
        supabase
          .from('donna_drive_notifications')
          .select('*')
          .eq('org_id', orgId)
          .eq('target_role', roleSlug)
          .order('created_at', { ascending: false }),
        supabase
          .from('donna_drive_din_bid_requests')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('donna_drive_din_bid_responses')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false }),
      ])

    return NextResponse.json({
      success: true,
      role: DEMO_ROLES.find((r) => r.slug === roleSlug),
      contacts: contactsRes.data || [],
      emails: emailsRes.data || [],
      tasks: tasksRes.data || [],
      documents: docsRes.data || [],
      calendar_events: calRes.data || [],
      notifications: notifRes.data || [],
      din_bid_requests: dinReqRes.data || [],
      din_bid_responses: dinResRes.data || [],
    })
  } catch (error) {
    console.error('[DONNA Drive] Data fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch demo data' },
      { status: 500 }
    )
  }
}
