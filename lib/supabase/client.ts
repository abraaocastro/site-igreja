/**
 * Supabase client para uso em componentes client-side ('use client').
 *
 * Usa @supabase/ssr pra que a sessão viva em cookies (ao invés de localStorage),
 * permitindo que server components e middleware leiam a mesma sessão.
 *
 * IMPORTANTE: use `createBrowserClient` apenas em client components. Para server
 * components/actions/route handlers, use `lib/supabase/server.ts`.
 *
 * Comportamento com envs ausentes:
 *   - Em DEV/PROD normal, as envs existem e retornamos um cliente real.
 *   - Durante `next build` sem `.env.local` (ex: CI limpo), as envs podem
 *     faltar. Nesse caso, logamos um warning e retornamos `null` — os
 *     consumidores (AuthProvider) tratam null como "deslogado, sem erro".
 *     Isso permite que o Next pré-renderize páginas estáticas sem crash.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export type BrowserSupabaseClient = SupabaseClient

/**
 * Retorna um cliente Supabase browser-side, ou `null` se as envs não
 * estiverem configuradas. Nunca lança — o chamador decide o que fazer
 * com `null` (ex: AuthProvider mostra estado deslogado).
 */
export function createClient(): BrowserSupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      // Client-side sem envs = configuração incompleta em produção.
      // Log claro pra facilitar debug, mas sem quebrar o render.
      // eslint-disable-next-line no-console
      console.warn(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ausentes. ' +
          'Login ficará desabilitado. Configure em .env.local (dev) ou Vercel env vars (prod).'
      )
    }
    return null
  }

  return createBrowserClient(url, key)
}
