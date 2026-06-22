/**
 * POST /api/demo/notifications/read
 *
 * Marks a notification as read in the database using the admin client.
 * Bypasses RLS policies for anonymous clients.
 *
 * Body: { id }
 * Returns: { success }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isDonnaDriveEnabled } from '@/lib/donna-drive/constants'

export async function POST(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DONNA Drive is not enabled' },
      { status: 403 }
    )
  }

  let body: { id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { id } = body
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Notification id is required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    // Preview mode — mock success
    return NextResponse.json({
      success: true,
      message: 'Preview mode: bypassed database update',
    })
  }

  try {
    const { error } = await supabase
      .from('donna_drive_notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DONNA Drive] Failed to mark notification as read:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update notification', error: String(error) },
      { status: 500 }
    )
  }
}
