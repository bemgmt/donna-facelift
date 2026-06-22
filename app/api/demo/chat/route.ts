import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isDonnaDriveEnabled } from '@/lib/donna-drive/constants'

export async function GET(request: NextRequest) {
  if (!isDonnaDriveEnabled()) {
    return NextResponse.json({ success: false, message: 'DONNA Drive is not enabled' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('org_id') || 'dd-org-001'
  const memberId = searchParams.get('member_id')

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: true, chats: [] })
  }

  try {
    let query = supabase
      .from('donna_drive_facilitator_chats')
      .select('*, donna_drive_members(display_name, email, industry)')
      .eq('org_id', orgId)

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data: chats, error } = await query.order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      chats: chats || []
    })

  } catch (error) {
    console.error('[DONNA Drive] Chat fetch error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch chats', error: String(error) }, { status: 500 })
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

  const { org_id = 'dd-org-001', member_id, sender, message } = body

  if (!member_id || !sender || !message) {
    return NextResponse.json({ success: false, message: 'member_id, sender, and message are required' }, { status: 400 })
  }

  if (sender !== 'attendee' && sender !== 'facilitator') {
    return NextResponse.json({ success: false, message: 'sender must be either attendee or facilitator' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({
      success: true,
      chat: {
        id: `dd-chat-preview-${Date.now()}`,
        org_id,
        member_id,
        sender,
        message,
        created_at: new Date().toISOString()
      }
    })
  }

  try {
    const chatId = `dd-chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const { data: chatRow, error: insertError } = await supabase
      .from('donna_drive_facilitator_chats')
      .insert({
        id: chatId,
        org_id,
        member_id,
        sender,
        message,
        created_at: new Date().toISOString()
      })
      .select('*, donna_drive_members(display_name, email, industry)')
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      chat: chatRow
    })

  } catch (error) {
    console.error('[DONNA Drive] Chat send error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send chat', error: String(error) }, { status: 500 })
  }
}
