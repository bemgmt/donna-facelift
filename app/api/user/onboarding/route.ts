import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/preview-auth'
import { getSupabaseAdminOrThrow } from '@/lib/supabase-admin'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'app/api/user/onboarding/route.ts:9',message:'GET onboarding auth evaluated',data:{hasClerkId:!!clerkId,clerkIdPrefix:clerkId?clerkId.slice(0,6):null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const supabaseAdmin = getSupabaseAdminOrThrow()

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: true, progress: null },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const { data: memoryData, error: memoryError } = await supabaseAdmin
      .from('user_memory')
      .select('value')
      .eq('user_id', userData.id)
      .eq('memory_type', 'onboarding')
      .eq('key', 'progress')
      .single()
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H2',location:'app/api/user/onboarding/route.ts:26',message:'GET onboarding user_memory query completed',data:{hasMemoryData:!!memoryData,memoryErrorCode:memoryError?.code||null,memoryErrorMessage:memoryError?.message||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (memoryError && memoryError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay for first time users
      throw memoryError
    }

    return NextResponse.json(
      {
        success: true,
        progress: memoryData?.value || null
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: unknown) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'app/api/user/onboarding/route.ts:42',message:'GET onboarding threw error',data:{errorMessage:err instanceof Error?err.message:String(err),errorName:err instanceof Error?err.name:'unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('Error fetching onboarding progress:', err)
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'app/api/user/onboarding/route.ts:57',message:'POST onboarding auth evaluated',data:{hasClerkId:!!clerkId,clerkIdPrefix:clerkId?clerkId.slice(0,6):null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const body = await req.json()
    const supabaseAdmin = getSupabaseAdminOrThrow()

    // Get user's database ID
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Upsert onboarding progress
    const { error: upsertError } = await supabaseAdmin
      .from('user_memory')
      .upsert({
        user_id: userData.id,
        memory_type: 'onboarding',
        key: 'progress',
        value: body,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,memory_type,key'
      })

    if (upsertError) {
      throw upsertError
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding progress saved'
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: unknown) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'app/api/user/onboarding/route.ts:108',message:'POST onboarding threw error',data:{errorMessage:err instanceof Error?err.message:String(err),errorName:err instanceof Error?err.name:'unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('Error saving onboarding progress:', err)
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Failed to save onboarding progress' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

