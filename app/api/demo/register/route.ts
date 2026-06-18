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

  const { user_id, email, name, company, phone, industry, org_id = 'dd-org-001' } = body

  if (!user_id || !email || !name) {
    return NextResponse.json(
      { success: false, message: 'user_id, email, and name are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    // Fallback preview mode
    return NextResponse.json({
      success: true,
      member_id: `dd-member-preview-${Date.now()}`,
      message: 'Registered successfully (Preview fallback)'
    })
  }

  try {
    const vertical = VERTICAL_MAP[industry] || 'real_estate'

    // 1. Insert or update the public.users record
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user_id,
        email,
        name,
        vertical,
        profile: { role: 'attendee' },
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (userError) throw userError

    // 2. Check if a member record already exists for this user in the event organization
    const { data: existingMember, error: fetchError } = await supabase
      .from('donna_drive_members')
      .select('id, role_id')
      .eq('org_id', org_id)
      .eq('user_id', user_id)
      .single()

    let memberId = existingMember?.id

    if (existingMember) {
      // Update existing member record
      const { error: updateError } = await supabase
        .from('donna_drive_members')
        .update({
          display_name: name,
          company: company || '',
          phone: phone || '',
          industry: industry || '',
          email
        })
        .eq('id', memberId)

      if (updateError) throw updateError
    } else {
      // Create new member record
      memberId = `dd-member-${Date.now()}`
      const { error: insertError } = await supabase
        .from('donna_drive_members')
        .insert({
          id: memberId,
          org_id,
          user_id,
          display_name: name,
          company: company || '',
          phone: phone || '',
          industry: industry || '',
          email,
          role_id: null, // assigned by admin during staging
          is_facilitator: false
        })

      if (insertError) throw insertError
    }

    return NextResponse.json({
      success: true,
      member_id: memberId,
      message: 'Attendee registered successfully'
    })

  } catch (error) {
    console.error('[DONNA Drive] Attendee registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to register attendee', error: String(error) },
      { status: 500 }
    )
  }
}
