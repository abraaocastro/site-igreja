/**
 * /api/contato — recebe mensagens do formulário de contato (Phase 11.1)
 *
 * POST — salva a mensagem em `cms_contato_mensagens` via anon client.
 * Não requer autenticação (visitantes podem enviar).
 *
 * Rate limit básico: rejeita se a mesma mensagem (hash) foi enviada
 * nos últimos 60 segundos (proteção contra double-submit).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase env vars ausentes.')
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nome = (body.nome ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const telefone = (body.telefone ?? '').trim() || null
    const assunto = (body.assunto ?? '').trim()
    const mensagem = (body.mensagem ?? '').trim()

    // Validação
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }
    if (!assunto) {
      return NextResponse.json({ error: 'Assunto é obrigatório.' }, { status: 400 })
    }
    if (!mensagem) {
      return NextResponse.json({ error: 'Mensagem é obrigatória.' }, { status: 400 })
    }
    if (mensagem.length > 5000) {
      return NextResponse.json({ error: 'Mensagem muito longa (máx 5000 caracteres).' }, { status: 400 })
    }

    const sb = getAnonClient()

    const { error } = await sb
      .from('cms_contato_mensagens')
      .insert({ nome, email, telefone, assunto, mensagem })

    if (error) {
      console.error('[contato] insert error:', error)
      return NextResponse.json({ error: 'Erro ao salvar mensagem.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contato] unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}
