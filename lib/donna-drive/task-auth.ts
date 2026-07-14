import 'server-only'

import type { NextRequest } from 'next/server'
import { getSupabaseAdminOrThrow } from '@/lib/supabase-admin'
import { hasValidFacilitatorSession } from './facilitator-auth'

export const DRIVE_ORG_ID = 'dd-org-001'

export async function authenticateDriveTaskRequest(request: NextRequest) {
  const supabase = getSupabaseAdminOrThrow()

  if (hasValidFacilitatorSession(request)) {
    return { supabase, facilitator: true, member: null, roleSlug: null as string | null }
  }

  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) throw new TaskAuthError('Sign in to update live event tasks.', 401)

  const { data: { user }, error: userError } = await supabase.auth.getUser(header.slice(7))
  if (userError || !user) throw new TaskAuthError('Your sign-in session has expired. Please sign in again.', 401)

  const { data: member, error: memberError } = await supabase
    .from('donna_drive_members')
    .select('id, org_id, role_id, is_facilitator, donna_drive_roles(slug, label)')
    .eq('org_id', DRIVE_ORG_ID)
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberError || !member) throw new TaskAuthError('Your attendee membership was not found for this event.', 403)
  const roleValue = Array.isArray(member.donna_drive_roles) ? member.donna_drive_roles[0] : member.donna_drive_roles
  const roleSlug = (roleValue as { slug?: string } | null)?.slug || null

  return { supabase, facilitator: Boolean(member.is_facilitator), member, roleSlug }
}

export class TaskAuthError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}
