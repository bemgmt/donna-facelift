import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SCENARIOS } from '@/lib/donna-drive/scenarios';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(req: NextRequest) {
  try {
    const { roleId, userName } = await req.json();

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });

    // Find the member's email
    const { data: memberData } = await supabase
        .from('donna_drive_members')
        .select('email, org_id')
        .eq('display_name', userName) // Or search by role
        .maybeSingle();

    if (!memberData?.email) {
       return NextResponse.json({ success: false, message: 'Member email not found' }, { status: 404 });
    }

    const { data: orgData } = await supabase
        .from('donna_drive_organizations')
        .select('*')
        .eq('id', memberData.org_id)
        .maybeSingle();

    const scenario = SCENARIOS.find(s => s.name === orgData?.property_name);

    // Get chat logs for summary
    const { data: chats } = await supabase
        .from('donna_drive_facilitator_chats')
        .select('*')
        .eq('org_id', memberData.org_id)
        .eq('member_id', roleId);

    const interactions = chats?.map(c => c.message).join('\n') || 'No significant interactions recorded.';

    const participantName = userName;
    const scenarioTitle = scenario?.name || 'Donna Drive Scenario';
    const roleName = scenario?.roles.find(r => r.id === roleId)?.title || roleId;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Your Donna Drive Session Summary</h2>
        <p>Hi ${participantName},</p>
        <p>Thanks for participating in today’s Donna Drive event.</p>
        <p><strong>Scenario:</strong><br/> ${scenarioTitle}</p>
        <p><strong>Your Role:</strong><br/> ${roleName}</p>
        <hr style="border: 1px solid #eee;" />
        <h3>Key Interactions & Completed Tasks:</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 13px;">${interactions.slice(-1000)}</pre>
        <hr style="border: 1px solid #eee;" />
        <p>Want Donna working inside your business every day?</p>
        <p><a href="https://askdonna.com" style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Learn more here</a></p>
        <p>– Donna<br/>Digital Operations Neural Network Assistant</p>
      </div>
    `;

    // Only send if we have a real key, otherwise just print to console for demo
    if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
            from: 'Donna Drive <donna@askdonna.com>', // ensure this is a verified domain
            to: memberData.email,
            subject: 'Your Donna Drive Session Summary',
            html: emailHtml
        });
    } else {
        console.log("RESEND_API_KEY not set. Would have sent email:");
        console.log(emailHtml);
    }

    return NextResponse.json({ success: true, message: 'Summary emailed' });

  } catch (error: any) {
    console.error('Summary API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
