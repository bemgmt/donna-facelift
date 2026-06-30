import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isDonnaDriveEnabled, DEMO_ROLES } from '@/lib/donna-drive/constants'
import { generateDemoSeedData, ScenarioKey } from '@/lib/donna-drive/seed-generator'
import { SCENARIOS } from '@/lib/donna-drive/scenarios'
import { authorizeDriveFacilitator } from '@/lib/donna-drive/auth'

export async function GET(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json({ success: false, message: 'DONNA Drive is not enabled' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('org_id') || 'dd-org-001'

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({
      success: true,
      org_status: 'inactive',
      members: [],
      message: 'Supabase not connected'
    })
  }

  try {
    // 1. Fetch organization status
    const { data: org, error: orgError } = await supabase
      .from('donna_drive_organizations')
      .select('*')
      .eq('id', orgId)
      .maybeSingle()

    if (orgError) throw orgError

    // 2. Fetch all members in staging/queue
    const { data: members, error: membersError } = await supabase
      .from('donna_drive_members')
      .select('*, donna_drive_roles(*)')
      .eq('org_id', orgId)
      .eq('is_facilitator', false)
      .order('assigned_at', { ascending: true })

    if (membersError) throw membersError

    // 3. Fetch past completed events for view historical event card
    const { data: pastOrgs, error: pastError } = await supabase
      .from('donna_drive_organizations')
      .select('*')
      .neq('id', orgId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      org_status: org?.status || 'inactive',
      org_name: org?.name || '',
      org_description: org?.description || '',
      property_name: org?.property_name || '',
      property_value: org?.property_value || '',
      members: members || [],
      past_events: pastError ? [] : (pastOrgs || [])
    })

  } catch (error) {
    console.error('[DONNA Drive] Event status GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch event status', error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json({ success: false, message: 'DONNA Drive is not enabled' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const { action, org_id = 'dd-org-001' } = body
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 })
  }

  const authorization = await authorizeDriveFacilitator(request, supabase, body)
  if (!authorization.authorized) {
    return NextResponse.json({ success: false, message: authorization.message }, { status: authorization.status })
  }

  try {
    if (action === 'stage') {
      const { scenario = 'vernon-commerce-center-acquisition', name = 'Donna Drive Scenario', description = '' } = body

      // Resolve the scenario pack from the SCENARIOS registry
      const scenarioPack = SCENARIOS.find(s => s.id === scenario)

      // Map full scenario ID to short seed-generator key
      const SCENARIO_ID_TO_SEED_KEY: Record<string, ScenarioKey> = {
        'vernon-commerce-center-acquisition': 'vernon',
        'monterey-medical-plaza-refinance': 'monterey',
        'downtown-retail-center-sale': 'downtown',
        'riverside-multifamily-acquisition': 'riverside',
        'commerce-distribution-center-development': 'commerce',
      }
      const seedKey = SCENARIO_ID_TO_SEED_KEY[scenario] || 'vernon'
      
      // Update organization state to staged
      const { error: orgError } = await supabase
        .from('donna_drive_organizations')
        .upsert({
          id: org_id,
          name: name,
          status: 'staged',
          property_name: scenarioPack?.name || 'Vernon Commerce Center Acquisition',
          property_value: scenarioPack?.propertyType || 'industrial acquisition',
          description: description,
          updated_at: new Date().toISOString()
        })

      if (orgError) throw orgError

      // Clear any pre-existing scenario data for this organization so we have a clean event run
      await Promise.all([
        supabase.from('donna_drive_roles').delete().eq('org_id', org_id),
        supabase.from('donna_drive_emails').delete().eq('org_id', org_id),
        supabase.from('donna_drive_tasks').delete().eq('org_id', org_id),
        supabase.from('donna_drive_documents').delete().eq('org_id', org_id),
        supabase.from('donna_drive_calendar_events').delete().eq('org_id', org_id),
        supabase.from('donna_drive_notifications').delete().eq('org_id', org_id),
        supabase.from('donna_drive_din_bid_requests').delete().eq('org_id', org_id),
        supabase.from('donna_drive_din_bid_responses').delete().eq('org_id', org_id),
        supabase.from('donna_drive_facilitator_chats').delete().eq('org_id', org_id)
      ])

      // Seed scenario data template
      const seedData = generateDemoSeedData(seedKey, org_id)
      
      // Insert seeded data rows
      if (scenarioPack && scenarioPack.roles && scenarioPack.roles.length > 0) {
        const rolesToInsert = scenarioPack.roles.map(r => ({
          id: r.id,
          org_id: org_id,
          slug: r.id,
          label: r.title,
          description: r.primaryObjective,
          icon: 'User',
          color: 'blue'
        }))
        await supabase.from('donna_drive_roles').insert(rolesToInsert)
      }

      if (seedData.contacts.length > 0) {
        await supabase.from('donna_drive_contacts').upsert(seedData.contacts)
      }
      if (seedData.emails.length > 0) {
        await supabase.from('donna_drive_emails').insert(seedData.emails)
      }
      if (seedData.tasks.length > 0) {
        await supabase.from('donna_drive_tasks').insert(seedData.tasks)
      }
      if (seedData.documents.length > 0) {
        await supabase.from('donna_drive_documents').insert(seedData.documents)
      }
      if (seedData.calendar_events.length > 0) {
        await supabase.from('donna_drive_calendar_events').insert(seedData.calendar_events)
      }
      if (seedData.notifications.length > 0) {
        await supabase.from('donna_drive_notifications').insert(seedData.notifications)
      }
      if (seedData.din_bid_requests.length > 0) {
        await supabase.from('donna_drive_din_bid_requests').insert(seedData.din_bid_requests)
      }
      if (seedData.din_bid_responses.length > 0) {
        await supabase.from('donna_drive_din_bid_responses').insert(seedData.din_bid_responses)
      }

      return NextResponse.json({ success: true, message: 'Event successfully staged' })

    } else if (action === 'auto_sort') {
      // Fetch all roles from database
      const { data: dbRoles, error: rolesError } = await supabase
        .from('donna_drive_roles')
        .select('*')
        .eq('org_id', org_id)

      if (rolesError || !dbRoles || dbRoles.length === 0) {
        throw new Error('Roles have not been seeded or configured for this organization')
      }

      // Fetch active staging room attendees
      const { data: members, error: membersError } = await supabase
        .from('donna_drive_members')
        .select('id')
        .eq('org_id', org_id)
        .eq('is_facilitator', false)

      if (membersError) throw membersError

      if (!members || members.length === 0) {
        return NextResponse.json({ success: false, message: 'No registered attendees in staging waiting room' }, { status: 400 })
      }

      // Auto-assign roles in round-robin fashion
      const updates = members.map((member, index) => {
        const role = dbRoles[index % dbRoles.length]
        return supabase
          .from('donna_drive_members')
          .update({ role_id: role.id })
          .eq('id', member.id)
      })

      await Promise.all(updates)

      return NextResponse.json({ success: true, message: 'Users auto-sorted to roles successfully' })

    } else if (action === 'assign_role') {
      const { member_id, role_slug } = body
      if (!member_id) {
        return NextResponse.json({ success: false, message: 'member_id is required' }, { status: 400 })
      }

      let roleId = null
      if (role_slug) {
        const { data: roleRow, error: roleError } = await supabase
          .from('donna_drive_roles')
          .select('id')
          .eq('org_id', org_id)
          .eq('slug', role_slug)
          .single()

        if (roleError || !roleRow) {
          return NextResponse.json({ success: false, message: `Role ${role_slug} not found` }, { status: 404 })
        }
        roleId = roleRow.id
      }

      const { error: updateError } = await supabase
        .from('donna_drive_members')
        .update({ role_id: roleId })
        .eq('id', member_id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, message: 'User role updated successfully' })

    } else if (action === 'start') {
      // Transition organization status to live
      const { error: orgError } = await supabase
        .from('donna_drive_organizations')
        .update({ status: 'live' })
        .eq('id', org_id)

      if (orgError) throw orgError

      // Inject the scenario start alert notification for all attendees
      const { data: members } = await supabase
        .from('donna_drive_members')
        .select('*, donna_drive_roles(*)')
        .eq('org_id', org_id)

      if (members) {
        const scenarioAlerts = members
          .filter(m => m.donna_drive_roles?.slug)
          .map(m => {
            return supabase
              .from('donna_drive_notifications')
              .insert({
                id: `dd-notif-start-${m.id}-${Date.now()}`,
                org_id,
                target_role: m.donna_drive_roles.slug,
                title: '🚨 TRANSACTION IS LIVE! Urgent Action Required',
                body: 'The commercial acquisition transaction has officially started. Open your Secretary module immediately to view the deal scenario instructions and get in the driver seat. First broker to complete all checklist tasks wins!',
                type: 'urgent',
                read: false
              })
          })
        await Promise.all(scenarioAlerts)
      }

      return NextResponse.json({ success: true, message: 'Event is now live!' })

    } else if (action === 'end') {
      // Transition organization status to completed
      const { error: orgError } = await supabase
        .from('donna_drive_organizations')
        .update({ status: 'completed' })
        .eq('id', org_id)

      if (orgError) throw orgError

      // Create a historical archive of this event run under a unique organization ID
      const archiveOrgId = `dd-org-completed-${Date.now()}`
      
      const { data: orgData } = await supabase
        .from('donna_drive_organizations')
        .select('*')
        .eq('id', org_id)
        .single()

      if (orgData) {
        // Copy organization details to the archive org
        await supabase
          .from('donna_drive_organizations')
          .insert({
            id: archiveOrgId,
            name: `${orgData.name} (Archived Run)`,
            status: 'completed',
            property_name: orgData.property_name,
            property_value: orgData.property_value,
            description: orgData.description,
            created_at: orgData.created_at
          })

        // Copy members to the archive organization context
        const { data: members } = await supabase
          .from('donna_drive_members')
          .select('*')
          .eq('org_id', org_id)

        if (members && members.length > 0) {
          const archiveMembers = members.map(m => ({
            ...m,
            id: `dd-member-arch-${m.id.split('-')[2] || Date.now()}-${Math.floor(Math.random() * 1000)}`,
            org_id: archiveOrgId
          }))
          await supabase.from('donna_drive_members').insert(archiveMembers)
        }
      }

      // Reset the main event organization back to inactive
      await supabase
        .from('donna_drive_organizations')
        .update({ status: 'inactive' })
        .eq('id', org_id)

      // Reset roles assigned to current active members
      await supabase
        .from('donna_drive_members')
        .update({ role_id: null })
        .eq('org_id', org_id)

      return NextResponse.json({ success: true, message: 'Event successfully completed and archived' })

    } else {
      return NextResponse.json({ success: false, message: `Invalid action: ${action}` }, { status: 400 })
    }

  } catch (error) {
    console.error('[DONNA Drive] Event status POST action error:', error)
    return NextResponse.json({ success: false, message: 'Failed to process event action', error: String(error) }, { status: 500 })
  }
}
