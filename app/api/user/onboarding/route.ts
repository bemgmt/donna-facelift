import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminOrThrow } from '@/lib/supabase-admin'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const supabaseAdmin = getSupabaseAdminOrThrow()
    
    // Get user's onboarding progress from user_memory table
    const { data: memoryData, error: memoryError } = await supabaseAdmin
      .from('user_memory')
      .select('value')
      .eq('user_id', clerkId)
      .eq('memory_type', 'onboarding')
      .eq('key', 'progress')
      .single()

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
    console.error('Error saving onboarding progress:', err)
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Failed to save onboarding progress' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

