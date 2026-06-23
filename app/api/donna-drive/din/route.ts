import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const myRoleId = searchParams.get('my_role_id');
    let targetOrgId = searchParams.get('org_id');

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });

    if (!targetOrgId) {
      // If orgId not explicitly passed, find the live one
      const { data: orgData } = await supabase
        .from('donna_drive_organizations')
        .select('id')
        .eq('status', 'live')
        .maybeSingle();
      
      if (!orgData) return NextResponse.json({ success: true, members: [] });
      targetOrgId = orgData.id;
    }

    // Fetch all members in the organization except the caller
    let query = supabase
      .from('donna_drive_members')
      .select('id, display_name, company, is_facilitator, donna_drive_roles(slug, label)')
      .eq('org_id', targetOrgId)
      .eq('is_facilitator', false);

    const { data: members, error } = await query;
    if (error) throw error;

    // We format the members for the UI
    const formatted = members
      .filter((m: any) => m.donna_drive_roles?.slug !== myRoleId)
      .map((m: any) => ({
        id: m.id,
        name: m.display_name,
        company: m.company,
        roleId: m.donna_drive_roles?.slug,
        roleLabel: m.donna_drive_roles?.label
      }));

    return NextResponse.json({ success: true, members: formatted });
  } catch (error: any) {
    console.error('DIN API GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { targetMemberId, message, senderRoleId } = await req.json();

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });

    const { data: orgData } = await supabase
        .from('donna_drive_organizations')
        .select('id')
        .eq('status', 'live')
        .maybeSingle();

    if (!orgData) return NextResponse.json({ success: false, message: 'No active event' }, { status: 400 });

    // Send a notification/email to the target member
    // For simplicity, we create a notification record for them
    await supabase.from('donna_drive_notifications').insert({
      id: `din-ping-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: orgData.id,
      target_role: targetMemberId, // using roleId or memberId depending on schema
      title: 'DIN Match: New Message',
      body: `Message from ${senderRoleId}: ${message}`,
      type: 'info',
      read: false
    });

    // Log the interaction
    await supabase.from('donna_drive_facilitator_chats').insert({
        id: `din-log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        org_id: orgData.id,
        member_id: senderRoleId,
        sender: 'din_system',
        message: `[DIN Match] Sent to ${targetMemberId}: ${message}`
    });

    return NextResponse.json({ success: true, message: 'Ping sent successfully' });
  } catch (error: any) {
    console.error('DIN API POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
