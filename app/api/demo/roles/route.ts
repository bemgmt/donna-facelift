/**
 * GET  /api/demo/roles  — List available demo roles
 * POST /api/demo/roles  — Assign a user to a demo role
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { DONNA_DRIVE_ENABLED, DEMO_ROLES } from '@/lib/donna-drive/constants'
import { DEMO_SEED_DATA } from '@/lib/donna-drive/seed-data'
import type { AssignRoleRequest, AssignRoleResponse, DemoRoleSlug } from '@/lib/donna-drive/types'

/**
 * GET — return the role catalog (no auth required)
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
    org_id: DEMO_SEED_DATA.org_id,
    roles: DEMO_ROLES,
  })
}

/**
 * POST — register a user and assign them to a demo role
 */
export async function POST(request: NextRequest) {
  if (!DONNA_DRIVE_ENABLED) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  let body: AssignRoleRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate role slug
  const roleDef = DEMO_ROLES.find((r) => r.slug === body.role_slug)
  if (!roleDef) {
    return NextResponse.json(
      { success: false, message: `Invalid role_slug: ${body.role_slug}` },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.user_name || !body.user_email) {
    return NextResponse.json(
      { success: false, message: 'user_name and user_email are required' },
      { status: 400 }
    )
  }

  const memberId = `dd-member-${Date.now()}`

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    // Preview mode — return a synthetic response
    return NextResponse.json({
      success: true,
      member_id: memberId,
      role: {
        id: `dd-role-preview`,
        slug: roleDef.slug as DemoRoleSlug,
        label: roleDef.label,
        description: roleDef.description,
        icon: roleDef.icon,
        color: roleDef.color,
        org_id: body.org_id,
      },
    } satisfies AssignRoleResponse)
  }

  try {
    // Find role row ID
    const { data: roleRow, error: roleError } = await supabase
      .from('donna_drive_roles')
      .select('id')
      .eq('slug', body.role_slug)
      .eq('org_id', body.org_id)
      .single()

    if (roleError || !roleRow) {
      return NextResponse.json(
        { success: false, message: 'Role not found in organization' },
        { status: 404 }
      )
    }

    // Insert member
    const { error: memberError } = await supabase
      .from('donna_drive_members')
      .insert({
        id: memberId,
        org_id: body.org_id,
        role_id: roleRow.id,
        display_name: body.user_name,
        company: body.user_company || '',
        email: body.user_email,
        phone: body.user_phone || '',
        industry: body.user_industry || '',
        is_facilitator: false,
      })

    if (memberError) throw memberError

    return NextResponse.json({
      success: true,
      member_id: memberId,
      role: {
        id: roleRow.id,
        slug: roleDef.slug as DemoRoleSlug,
        label: roleDef.label,
        description: roleDef.description,
        icon: roleDef.icon,
        color: roleDef.color,
        org_id: body.org_id,
      },
    } satisfies AssignRoleResponse)
  } catch (error) {
    console.error('[DONNA Drive] Role assignment error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to assign role', error: String(error) },
      { status: 500 }
    )
  }
}
