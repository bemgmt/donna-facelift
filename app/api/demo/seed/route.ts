/**
 * POST /api/demo/seed
 *
 * Seeds the demo organization, roles, and all transaction data into Supabase.
 * Protected by a facilitator secret or an admin Supabase session.
 *
 * Body: { facilitator_secret?: string, scenario?: string }
 * Returns: { success, org_id, roles[], message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  isDonnaDriveEnabled,
  DEMO_ORG_NAME,
  DEMO_PROPERTY_NAME,
  DEMO_PROPERTY_VALUE,
  DEMO_PROPERTY_DESCRIPTION,
} from '@/lib/donna-drive/constants'
import { generateDemoSeedData, ScenarioKey } from '@/lib/donna-drive/seed-generator'
import { SCENARIOS } from '@/lib/donna-drive/scenarios'
import { authorizeDriveFacilitator } from '@/lib/donna-drive/auth'
import type { SeedDemoRequest, SeedDemoResponse } from '@/lib/donna-drive/types'

export async function POST(request: NextRequest) {
  // Feature gate
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  // Parse body
  let body: SeedDemoRequest
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

  const scenarioKey = (body.scenario as ScenarioKey) || 'vernon'
  const orgId = 'dd-org-001'
  const seedData = generateDemoSeedData(scenarioKey, orgId)

  const SCENARIO_KEY_TO_ID: Record<string, string> = {
    'vernon': 'vernon-commerce-center-acquisition',
    'monterey': 'monterey-medical-plaza-refinance',
    'downtown': 'downtown-retail-center-sale',
    'riverside': 'riverside-multifamily-acquisition',
    'commerce': 'commerce-distribution-center-development'
  }
  const scenarioId = SCENARIO_KEY_TO_ID[scenarioKey] || 'vernon-commerce-center-acquisition'
  const scenarioPack = SCENARIOS.find(s => s.id === scenarioId)

  const roleRows = scenarioPack ? scenarioPack.roles.map(r => ({
    id: r.id,
    slug: r.id,
    label: r.title,
    description: r.primaryObjective,
    icon: 'User',
    color: 'blue',
    org_id: seedData.org_id,
  })) : []

  if (!supabase) {
    // Fallback: return seed data shape without persisting (useful for preview)
    return NextResponse.json({
      success: true,
      org_id: seedData.org_id,
      roles: roleRows,
      message: 'Seed data returned (Supabase not connected — preview mode)',
    } satisfies SeedDemoResponse)
  }

  try {
    // 1. Upsert the demo organization
    const { error: orgError } = await supabase
      .from('donna_drive_organizations')
      .upsert(
        {
          id: seedData.org_id,
          name: DEMO_ORG_NAME,
          status: 'demo',
          property_name: DEMO_PROPERTY_NAME,
          property_value: DEMO_PROPERTY_VALUE,
          description: DEMO_PROPERTY_DESCRIPTION,
        },
        { onConflict: 'id' }
      )

    if (orgError) throw orgError

    // 2. Upsert roles
    const { error: rolesError } = await supabase
      .from('donna_drive_roles')
      .upsert(roleRows, { onConflict: 'id' })

    if (rolesError) throw rolesError

    // 3. Upsert contacts
    const { error: contactsError } = await supabase
      .from('donna_drive_contacts')
      .upsert(seedData.contacts, { onConflict: 'id' })

    if (contactsError) throw contactsError

    // 4. Upsert emails
    const { error: emailsError } = await supabase
      .from('donna_drive_emails')
      .upsert(seedData.emails, { onConflict: 'id' })

    if (emailsError) throw emailsError

    // 5. Upsert tasks
    const { error: tasksError } = await supabase
      .from('donna_drive_tasks')
      .upsert(seedData.tasks, { onConflict: 'id' })

    if (tasksError) throw tasksError

    // 6. Upsert documents
    const { error: docsError } = await supabase
      .from('donna_drive_documents')
      .upsert(seedData.documents, { onConflict: 'id' })

    if (docsError) throw docsError

    // 7. Upsert calendar events
    const { error: calError } = await supabase
      .from('donna_drive_calendar_events')
      .upsert(seedData.calendar_events, { onConflict: 'id' })

    if (calError) throw calError

    // 8. Upsert notifications
    const { error: notifError } = await supabase
      .from('donna_drive_notifications')
      .upsert(seedData.notifications, { onConflict: 'id' })

    if (notifError) throw notifError

    // 9. Upsert DIN Bid Requests
    if (seedData.din_bid_requests.length > 0) {
      const { error: dinReqError } = await supabase
        .from('donna_drive_din_bid_requests')
        .upsert(seedData.din_bid_requests, { onConflict: 'id' })
      if (dinReqError) throw dinReqError
    }

    // 10. Upsert DIN Bid Responses
    if (seedData.din_bid_responses.length > 0) {
      const { error: dinResError } = await supabase
        .from('donna_drive_din_bid_responses')
        .upsert(seedData.din_bid_responses, { onConflict: 'id' })
      if (dinResError) throw dinResError
    }

    return NextResponse.json({
      success: true,
      org_id: seedData.org_id,
      roles: roleRows,
      message: 'Demo organization seeded successfully',
    } satisfies SeedDemoResponse)
  } catch (error) {
    console.error('[DONNA Drive] Seed error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to seed demo data', error: String(error) },
      { status: 500 }
    )
  }
}
