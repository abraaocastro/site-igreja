/**
 * Middleware — defesa em profundidade no lado do servidor.
 *
 * Roda antes de cada request a rotas protegidas. Garante 3 coisas:
 *   1. /admin/* sem sessão → redireciona pra /login
 *   2. /admin/* com `must_change_password: true` → redireciona pra
 *      /admin/primeiro-acesso (única rota /admin/* permitida nesse estado)
 *   3. Mantém os cookies de sessão renovados (requisito do @supabase/ssr)
 *
 * Guard client-side continua existindo em `app/admin/page.tsx` pra UX, mas
 * é apenas cosmético — este middleware é a barreira real de segurança.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Response mutable — `supabase.auth.getUser()` pode renovar cookies nela.
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Se as envs não existem em dev, deixa passar — senão quebraria o site inteiro.
  // Em produção, o build vai falhar antes se essas envs estiverem faltando.
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request: { headers: request.headers } })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isFirstAccessRoute = pathname === '/admin/primeiro-acesso'

  if (isAdminRoute) {
    // Sem sessão → /login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Logado mas ainda precisa trocar senha → força /admin/primeiro-acesso
    const mustChange = Boolean(user.user_metadata?.must_change_password)
    if (mustChange && !isFirstAccessRoute) {
      return NextResponse.redirect(new URL('/admin/primeiro-acesso', request.url))
    }

    // Já trocou senha mas tá batendo em /primeiro-acesso → manda pra /admin
    if (!mustChange && isFirstAccessRoute) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Roda em tudo EXCETO:
     *  - _next (assets internos do Next)
     *  - arquivos públicos com extensão (.png, .ico, .svg, etc.)
     *  - api routes (cada uma controla seu próprio auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
