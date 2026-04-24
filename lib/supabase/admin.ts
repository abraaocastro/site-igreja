/**
 * Supabase client com SERVICE_ROLE key — bypassa RLS e pode fazer operações
 * administrativas (criar usuários, setar metadata, deletar, etc.).
 *
 * ⚠️  NUNCA importe isto em client components. NUNCA log a chave. Use APENAS
 * em:
 *   - Scripts CLI (scripts/bootstrap-admin.ts)
 *   - Route handlers server-only (app/api/admin/...)
 *   - Server actions
 *
 * A presença da env `SUPABASE_SERVICE_ROLE_KEY` (SEM `NEXT_PUBLIC_`) garante
 * que Next.js não embute a chave no bundle de client.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('[supabase/admin] NEXT_PUBLIC_SUPABASE_URL ausente')
  }
  if (!serviceKey) {
    throw new Error(
      '[supabase/admin] SUPABASE_SERVICE_ROLE_KEY ausente. ' +
        'Esta chave existe apenas no server — nunca use NEXT_PUBLIC_. ' +
        'Pegue em: Settings → API → service_role'
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
