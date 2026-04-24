/**
 * Supabase client para uso em server components, route handlers e middleware.
 *
 * Lê/grava cookies pela API do Next.js para manter a sessão sincronizada entre
 * browser e servidor (SSR-safe).
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      '[supabase] Env vars ausentes. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Chamado de um server component onde cookies() é read-only.
          // Isso é esperado e pode ser ignorado — middleware cuidará da renovação.
        }
      },
    },
  })
}
