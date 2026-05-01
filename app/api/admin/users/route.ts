/**
 * /api/admin/users — CRUD de usuários conteudistas (Phase 10.1)
 *
 * Todas as operações usam o `createAdminClient()` (service_role) porque:
 *   - Criar usuários em auth.users requer service_role
 *   - Listar auth.users requer service_role
 *   - Deletar auth.users requer service_role
 *
 * A autorização (só admins podem chamar) é verificada antes de cada
 * operação checando o token do request contra profiles.role.
 *
 * POST   — Convida novo conteudista (email + nome → cria user + profile)
 * GET    — Lista todos os usuários com role + último login
 * DELETE — Revoga acesso de um conteudista (deleta auth.users + cascade em profiles)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { generatePassphrase } from '@/lib/password-strength'

// ---------------------------------------------------------------------------
// Helper: verificar se quem está chamando é admin
// ---------------------------------------------------------------------------
async function assertAdmin(request: NextRequest): Promise<{ ok: true; adminId: string } | { ok: false; response: NextResponse }> {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return { ok: false, response: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }) }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return { ok: false, response: NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 }) }
    }

    return { ok: true, adminId: session.user.id }
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Erro ao verificar permissão.' }, { status: 500 }) }
  }
}

// ---------------------------------------------------------------------------
// GET — Listar usuários
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const auth = await assertAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const admin = createAdminClient()

    // Listar todos os auth users
    const { data: authData, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 })
    }

    // Buscar profiles pra pegar role + nome
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, nome, role, created_at')

    const profileMap = new Map(
      (profiles ?? []).map((p: { id: string; email: string; nome: string | null; role: string; created_at: string }) => [p.id, p])
    )

    const users = authData.users.map((u) => {
      const p = profileMap.get(u.id)
      return {
        id: u.id,
        email: u.email ?? '',
        nome: p?.nome ?? u.user_metadata?.nome ?? null,
        role: p?.role ?? 'conteudista',
        createdAt: p?.created_at ?? u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
      }
    })

    // Ordenar: admin primeiro, depois por nome
    users.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1
      if (a.role !== 'admin' && b.role === 'admin') return 1
      return (a.nome ?? a.email).localeCompare(b.nome ?? b.email)
    })

    return NextResponse.json({ users })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST — Convidar novo conteudista
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const auth = await assertAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const email = (body.email ?? '').trim().toLowerCase()
    const nome = (body.nome ?? '').trim()

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 })
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verificar se já existe
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const alreadyExists = existing?.users.some((u) => u.email?.toLowerCase() === email)
    if (alreadyExists) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail.' }, { status: 409 })
    }

    // Gerar senha segura
    const generatedPassword = generatePassphrase()

    // Criar usuário no auth
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true, // dispensa confirmação de e-mail
      user_metadata: {
        nome,
        must_change_password: true,
      },
    })

    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message ?? 'Erro ao criar usuário.' },
        { status: 500 }
      )
    }

    // A trigger handle_new_user já cria o profile com role='conteudista'.
    // Mas vamos garantir com upsert (caso trigger ainda não exista).
    await admin.from('profiles').upsert(
      {
        id: created.user.id,
        email,
        nome,
        role: 'conteudista',
      },
      { onConflict: 'id' }
    )

    return NextResponse.json({
      user: {
        id: created.user.id,
        email,
        nome,
        role: 'conteudista',
      },
      generatedPassword,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE — Revogar acesso de conteudista
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  const auth = await assertAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 })
    }

    // Não permitir que admin delete a si mesmo
    if (userId === auth.adminId) {
      return NextResponse.json({ error: 'Você não pode remover seu próprio acesso.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verificar que o alvo não é admin (proteção extra)
    const { data: targetProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json({ error: 'Não é possível remover outro administrador.' }, { status: 403 })
    }

    // Deletar (cascade em profiles vem do FK)
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId)

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}
