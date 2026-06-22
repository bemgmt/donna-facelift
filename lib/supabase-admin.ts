/**
 * Supabase admin client – lazily instantiated when the required environment
 * variables are present. It is used for privileged server‑side operations
 * such as logging facilitator warnings.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const supabaseAdmin: SupabaseClient | undefined =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : undefined

/**
 * Retrieve the admin client or throw a descriptive error if it is unavailable.
 */
export function getSupabaseAdminOrThrow(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const reason = !url || !key ? 'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' : 'client not initialized'
  throw new Error(`Supabase admin client unavailable: ${reason}`)
}

/**
 * Return the admin client if it exists; otherwise `undefined`.
 */
export function getSupabaseAdmin(): SupabaseClient | undefined {
  return supabaseAdmin
}

/**
 * Log a warning message to the `facilitator_logs` table. Errors are ignored so
 * that logging does not interfere with normal execution.
 */
export async function logFacilitatorWarning(message: string): Promise<void> {
  if (!supabaseAdmin) return
  try {
    await supabaseAdmin
      .from('facilitator_logs')
      .insert({
        message,
        level: 'warning',
        created_at: new Date().toISOString(),
      })
  } catch (_) {
    // silent fail
  }
}
