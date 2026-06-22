// lib/donna-drive/log-utils.ts

import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Log a warning message to the `facilitator_logs` Supabase table.
 * Errors while logging are deliberately ignored so that the primary
 * application flow is not disrupted.
 */
export async function logWarning(message: string): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin
      .from('facilitator_logs')
      .insert({
        message,
        level: 'warning',
        created_at: new Date().toISOString(),
      });
  } catch (_) {
    // swallow any logging errors – they are non‑critical
  }
}
