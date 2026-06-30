import type { NextRequest } from 'next/server'

type SupabaseLike = {
  auth?: {
    getUser: (token: string) => Promise<{ data?: { user?: { id?: string } | null }; error?: unknown }>
  }
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => PromiseLike<{ data?: Record<string, unknown> | null; error?: unknown }>
      }
    }
  }
}

export type DriveAuthorization = {
  authorized: boolean
  status: number
  message: string
}

const FACILITATOR_ROLES = new Set(['admin', 'facilitator', 'drive_facilitator'])

function success(): DriveAuthorization {
  return { authorized: true, status: 200, message: 'Authorized' }
}

function failure(status: number, message: string): DriveAuthorization {
  return { authorized: false, status, message }
}

function roleFromProfile(profile: Record<string, unknown> | null | undefined): string | null {
  if (!profile) return null
  const value = profile.drive_role ?? profile.donna_drive_role ?? profile.role
  return typeof value === 'string' ? value : null
}

export async function authorizeDriveFacilitator(
  request: NextRequest,
  supabaseClient: unknown,
  body?: { facilitator_secret?: unknown }
): Promise<DriveAuthorization> {
  const supabase = supabaseClient as SupabaseLike | null

  const expectedSecret = process.env.DONNA_DRIVE_FACILITATOR_SECRET
  const providedSecret = body?.facilitator_secret

  if (
    expectedSecret &&
    typeof providedSecret === 'string' &&
    providedSecret === expectedSecret
  ) {
    return success()
  }

  const authorization = request.headers.get('authorization')
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null

  if (!token) {
    return failure(401, 'Drive facilitator authorization is required')
  }

  if (!supabase?.auth?.getUser) {
    return failure(500, 'Drive facilitator authorization is not configured')
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  const userId = userData?.user?.id

  if (userError || !userId) {
    return failure(401, 'Invalid Drive facilitator session')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, drive_role, donna_drive_role')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    return failure(403, 'Unable to verify Drive facilitator role')
  }

  const role = roleFromProfile(profile)
  if (!role || !FACILITATOR_ROLES.has(role)) {
    return failure(403, 'Drive facilitator role is required')
  }

  return success()
}
