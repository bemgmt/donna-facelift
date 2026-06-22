/**
 * POST /api/demo/convert
 *
 * Converts a demo organization into an active organization, transitioning
 * the user from the demo experience into actual platform usage.
 *
 * Body: { org_id: string, new_org_name: string }
 * Returns: { success: boolean, new_org_id: string, message: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isDonnaDriveEnabled } from '@/lib/donna-drive/constants'
import type { ConvertDemoRequest, ConvertDemoResponse } from '@/lib/donna-drive/types'

export async function POST(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  let body: ConvertDemoRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  if (!body.org_id || !body.new_org_name) {
    return NextResponse.json(
      { success: false, message: 'org_id and new_org_name are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    // Preview mode
    return NextResponse.json({
      success: true,
      new_org_id: `org-${Date.now()}`,
      message: 'Demo converted to active workspace (preview mode)',
    } satisfies ConvertDemoResponse)
  }

  try {
    // 1. Update the organization status to 'active' and rename it
    const { data: org, error: orgError } = await supabase
      .from('donna_drive_organizations')
      .update({
        name: body.new_org_name,
        status: 'active',
        property_name: null,
        property_value: null,
        description: 'Converted from DONNA Drive',
      })
      .eq('id', body.org_id)
      .select('id')
      .single()

    if (orgError) throw orgError

    // 2. Clear out demo data (emails, tasks, calendar) but keep documents?
    // The instructions say "without recreating accounts". The easiest way
    // to handle this in the demo table structure is to just change the org status.
    // In a real app, you might migrate them to the main `organizations` table.
    
    // For now, we will simply delete demo tasks, emails, and notifications
    await supabase.from('donna_drive_tasks').delete().eq('org_id', body.org_id)
    await supabase.from('donna_drive_emails').delete().eq('org_id', body.org_id)
    await supabase.from('donna_drive_notifications').delete().eq('org_id', body.org_id)

    return NextResponse.json({
      success: true,
      new_org_id: org.id,
      message: 'Successfully converted to active workspace',
    } satisfies ConvertDemoResponse)
  } catch (error) {
    console.error('[DONNA Drive] Conversion error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to convert workspace', error: String(error) },
      { status: 500 }
    )
  }
}
