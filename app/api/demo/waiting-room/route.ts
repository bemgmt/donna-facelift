import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { DONNA_DRIVE_ENABLED } from '@/lib/donna-drive/constants'

const VERTICAL_MAP: Record<string, string> = {
  'Real Estate': 'real_estate',
  'Hospitality': 'hospitality',
  'Professional Services': 'professional_services',
  'real_estate': 'real_estate',
  'hospitality': 'hospitality',
  'professional_services': 'professional_services'
}

export async function GET(request: NextRequest) {
  if (!DONNA_DRIVE_ENABLED) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('member_id')
  const orgId = searchParams.get('org_id') || 'dd-org-001'

  if (!memberId) {
    return NextResponse.json(
      { success: false, message: 'member_id query param is required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    // Preview fallback
    return NextResponse.json({
      success: true,
      org_status: 'staged',
      role_slug: 'commercial_broker',
      role_label: 'Commercial Broker',
      industry: 'Real Estate'
    })
  }

  try {
    // 1. Fetch organization status
    const { data: org, error: orgError } = await supabase
      .from('donna_drive_organizations')
      .select('status')
      .eq('id', orgId)
      .maybeSingle()

    if (orgError) throw orgError

    // 2. Fetch member details
    const { data: member, error: memberError } = await supabase
      .from('donna_drive_members')
      .select('*, donna_drive_roles(*)')
      .eq('id', memberId)
      .maybeSingle()

    if (memberError) throw memberError

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      org_status: org?.status || 'inactive',
      role_slug: member.donna_drive_roles?.slug || '',
      role_label: member.donna_drive_roles?.label || 'Not Assigned Yet',
      industry: member.industry || 'Real Estate'
    })

  } catch (error) {
    console.error('[DONNA Drive] Waiting room check error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch status', error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!DONNA_DRIVE_ENABLED) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { member_id, industry, org_id = 'dd-org-001' } = body

  if (!member_id || !industry) {
    return NextResponse.json(
      { success: false, message: 'member_id and industry are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: true, message: 'Industry updated (Preview)' })
  }

  try {
    const vertical = VERTICAL_MAP[industry] || 'real_estate'

    // 1. Get the member's user_id
    const { data: member, error: memberFetchError } = await supabase
      .from('donna_drive_members')
      .select('user_id')
      .eq('id', member_id)
      .single()

    if (memberFetchError || !member) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 })
    }

    // 2. Check if organization is locked
    const { data: org } = await supabase
      .from('donna_drive_organizations')
      .select('status')
      .eq('id', org_id)
      .single()

    if (org && (org.status === 'live' || org.status === 'completed')) {
      return NextResponse.json({ success: false, message: 'Event is already live or completed; industry selection is locked' }, { status: 400 })
    }

    // 3. Update industry on member record
    const { error: memberError } = await supabase
      .from('donna_drive_members')
      .update({ industry })
      .eq('id', member_id)

    if (memberError) throw memberError

    // 4. Update vertical on users record
    if (member.user_id) {
      const { error: userError } = await supabase
        .from('users')
        .update({ vertical })
        .eq('id', member.user_id)

      if (userError) throw userError
    }

    return NextResponse.json({
      success: true,
      message: 'Industry vertical updated successfully'
    })

  } catch (error) {
    console.error('[DONNA Drive] Update industry error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update industry', error: String(error) },
      { status: 500 }
    )
  }
}
