import { auth } from '@/lib/preview-auth'
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSupabaseAdminOrThrow } from '@/lib/supabase-admin'
import { z } from 'zod'
import { parseJson, isBadRequestError } from '@/lib/http-parse'
import { isValidVertical, ALLOWED_VERTICALS } from '@/lib/constants/verticals'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } })
    }

    const schema = z.object({ 
      vertical: z.string().refine((val) => isValidVertical(val), {
        message: `Vertical must be one of: ${ALLOWED_VERTICALS.join(', ')}`
      })
    })
    const { vertical } = await parseJson(req, schema)

    const supabaseAdmin = getSupabaseAdminOrThrow()
    
    // Upsert user if they don't exist (e.g. new users from onboarding who haven't been synced yet)
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .upsert({ clerk_id: clerkId, vertical }, { onConflict: 'clerk_id' })
        .select('id')
        .single()

    if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ success: true, vertical }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err: unknown) {
    if (isBadRequestError(err)) {
      return NextResponse.json({ error: err.message }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }
    console.error("Error in vertical route:", err);
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Failed to update vertical' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

// GET endpoint to retrieve user's vertical
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } })
    }

    const supabaseAdmin = getSupabaseAdminOrThrow()
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('vertical')
        .eq('clerk_id', clerkId)
        .single()

    if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json(
      { success: true, vertical: userData.vertical || null },
      { headers: { 'Cache-Control': 'no-store' } }
    );

  } catch (err: unknown) {
    console.error("Error in get vertical route:", err);
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Failed to retrieve vertical' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

