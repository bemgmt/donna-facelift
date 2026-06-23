import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SCENARIOS } from '@/lib/donna-drive/scenarios';
import OpenAI from 'openai';

// Initialize OpenAI client – ensure the API key is provided via environment variable.
if (!process.env.OPENAI_API_KEY) {
  console.warn('OpenAI API key is not set in environment; OpenAI requests will fail.');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, roleId } = await req.json();

    // Acquire a guaranteed Supabase admin client; this will throw a clear error if env vars are missing.
    const supabase = getSupabaseAdminOrThrow();

    // Identify active live scenario from organizations
    const { data: orgData } = await supabase
      .from('donna_drive_organizations')
      .select('*')
      .eq('status', 'live')
      .maybeSingle();

    if (!orgData) {
      return NextResponse.json({ success: false, message: 'No active live event found.' }, { status: 400 });
    }

    // Try to find the scenario by matching name to property_name (from the mapping we did earlier)
    const scenario = SCENARIOS.find(s => s.name === orgData.property_name);
    
    if (!scenario) {
      return NextResponse.json({ success: false, message: 'Scenario context not found' }, { status: 404 });
    }

    // Find the participant's role inside the scenario
    const roleDef = scenario.roles.find(r => r.id === roleId);

    // Extract the participant's tasks, inbox, and available DIN roles
    const myTasks = scenario.tasks
      .filter(t => t.ownerRoleId === roleId)
      .map((t, i) => `  ${i + 1}. [${t.status.toUpperCase()}] ${t.title} (deps: ${t.dependencies.length > 0 ? t.dependencies.join(', ') : 'none'})`)
      .join('\n');

    const myInbox = scenario.inbox
      .filter(i => i.toRoleId === roleId)
      .map((item, i) => `  ${i + 1}. [${item.priority.toUpperCase()}] ${item.subject} — ${item.summary}`)
      .join('\n');

    const otherRoles = scenario.roles
      .filter(r => r.id !== roleId)
      .map(r => `  - ${r.title}: ${r.primaryObjective}`)
      .join('\n');

    // Build the system prompt
    const basePrompt = `You are Donna, the Digital Operations Neural Network Assistant, operating inside a Donna Drive event.
Your job is to guide the participant through their assigned role in the selected scenario.

Scenario Name: ${scenario.name}
Scenario Brief: ${scenario.scenarioBrief}

Participant Role: ${roleDef ? roleDef.title : roleId}
Primary Objective: ${roleDef ? roleDef.primaryObjective : 'N/A'}
Secondary Objective: ${roleDef ? roleDef.secondaryObjective : 'N/A'}
Secretary Overlay Instructions: ${roleDef ? roleDef.secretaryOverlay : 'N/A'}

YOUR TASKS:
${myTasks || '  No tasks currently assigned.'}

YOUR INBOX / LEADS:
${myInbox || '  No inbox items right now.'}

OTHER ROLES IN THIS SCENARIO (available via DIN):
${otherRoles || '  No other roles available.'}

You must:
- Understand the participant's role
- Review their assigned tasks
- Recommend what they should do next
- Help prioritize leads and actions
- Suggest when to use DIN to contact another role
- Track completed tasks
- Keep responses practical and action-oriented
- Avoid generic answers
- Stay within the selected Donna Drive scenario
- Log meaningful actions for the final event summary

When the participant asks what to do, give a clear next step based on task priority and dependencies.
When the participant asks about leads, return the prioritized inbox items above.
When the participant needs another role, suggest a DIN match from the available roles.
When a task is completed, mark it complete.
When the session ends, prepare a clean summary of what happened.`;

    const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o';
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: basePrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const reply = response.choices[0]?.message?.content || "I'm having trouble processing that request.";

    // Log the interaction
    await supabase.from('donna_drive_facilitator_chats').insert({
      id: `sec-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      org_id: orgData.id,
      member_id: roleId,
      sender: 'secretary',
      message: `[Participant: ${message}] -> [Donna: ${reply}]`
    });

    return NextResponse.json({ success: true, reply });

  } catch (error: any) {
    console.error('Secretary API error:', error);
    // Do not expose internal details to the client
    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
