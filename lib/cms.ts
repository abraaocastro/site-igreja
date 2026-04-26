/**
 * lib/cms.ts — leitores e escritores do conteúdo CMS no Supabase.
 *
 * Substitui o stack baseado em localStorage. Todas as funções de leitura
 * caem em **defaults estáticos** (vindos de `lib/data.ts`) caso o cliente
 * Supabase não esteja disponível ou a tabela esteja vazia — assim a build
 * estática + a primeira renderização nunca quebram.
 *
 * Convenção:
 *   - DB usa snake_case (`image_url`, `leader_instagram`, `link_texto`)
 *   - App usa camelCase (`imageUrl`, `leaderInstagram`, `linkTexto`)
 *   - As funções `fromRow()` / `toRow()` traduzem nas bordas.
 *
 * Reads: usam o cliente browser (`createClient()` de `lib/supabase/client`).
 * RLS permite SELECT pra anon, então funciona sem login.
 * Writes: idem (RLS bloqueia se o user logado não for admin/conteudista).
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import {
  heroBanners as defaultBanners,
  ministerios as defaultMinisterios,
  eventos as defaultEventos,
} from '@/lib/data'
import type { ChurchAviso, AvisoSeveridade } from '@/lib/site-data'

// ============================================================
// Tipos públicos (camelCase, usados no app)
// ============================================================

export interface CmsBanner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  buttonText: string | null
  link: string | null
  sortOrder: number
}

export interface CmsMinisterio {
  id: string
  name: string
  description: string
  imageUrl: string
  leader: string
  leaderInstagram: string | null
  sortOrder: number
}

export interface CmsEvento {
  id: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  time: string
  location: string
  category: string
  imageUrl: string | null
}

export type CmsTextos = Record<string, string>

export const DEFAULT_TEXTOS: CmsTextos = {
  homeTitulo: 'Bem-vindo à Nossa Igreja',
  homeSubtitulo:
    'Somos uma comunidade de fé comprometida em amar a Deus e ao próximo',
  versiculoDestaque:
    'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  versiculoReferencia: 'João 3:16',
}

const DEFAULT_AVISO: ChurchAviso = {
  ativo: false,
  severidade: 'info',
  mensagem: '',
  link: null,
  linkTexto: null,
}

// ============================================================
// Mapeadores DB ↔ App
// ============================================================

interface BannerRow {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  button_text: string | null
  link: string | null
  sort_order: number
}
const bannerFromRow = (r: BannerRow): CmsBanner => ({
  id: r.id,
  title: r.title,
  subtitle: r.subtitle,
  imageUrl: r.image_url,
  buttonText: r.button_text,
  link: r.link,
  sortOrder: r.sort_order,
})
const bannerToRow = (b: Partial<CmsBanner>): Partial<BannerRow> => ({
  ...(b.title !== undefined && { title: b.title }),
  ...(b.subtitle !== undefined && { subtitle: b.subtitle }),
  ...(b.imageUrl !== undefined && { image_url: b.imageUrl }),
  ...(b.buttonText !== undefined && { button_text: b.buttonText }),
  ...(b.link !== undefined && { link: b.link }),
  ...(b.sortOrder !== undefined && { sort_order: b.sortOrder }),
})

interface MinisterioRow {
  id: string
  name: string
  description: string
  image_url: string
  leader: string
  leader_instagram: string | null
  sort_order: number
}
const ministerioFromRow = (r: MinisterioRow): CmsMinisterio => ({
  id: r.id,
  name: r.name,
  description: r.description,
  imageUrl: r.image_url,
  leader: r.leader,
  leaderInstagram: r.leader_instagram,
  sortOrder: r.sort_order,
})
const ministerioToRow = (m: Partial<CmsMinisterio>): Partial<MinisterioRow> => ({
  ...(m.name !== undefined && { name: m.name }),
  ...(m.description !== undefined && { description: m.description }),
  ...(m.imageUrl !== undefined && { image_url: m.imageUrl }),
  ...(m.leader !== undefined && { leader: m.leader }),
  ...(m.leaderInstagram !== undefined && { leader_instagram: m.leaderInstagram }),
  ...(m.sortOrder !== undefined && { sort_order: m.sortOrder }),
})

interface EventoRow {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  image_url: string | null
}
const eventoFromRow = (r: EventoRow): CmsEvento => ({
  id: r.id,
  title: r.title,
  description: r.description,
  date: r.date,
  time: r.time,
  location: r.location,
  category: r.category,
  imageUrl: r.image_url,
})
const eventoToRow = (e: Partial<CmsEvento>): Partial<EventoRow> => ({
  ...(e.title !== undefined && { title: e.title }),
  ...(e.description !== undefined && { description: e.description }),
  ...(e.date !== undefined && { date: e.date }),
  ...(e.time !== undefined && { time: e.time }),
  ...(e.location !== undefined && { location: e.location }),
  ...(e.category !== undefined && { category: e.category }),
  ...(e.imageUrl !== undefined && { image_url: e.imageUrl }),
})

interface AvisoRow {
  id: number
  ativo: boolean
  severidade: AvisoSeveridade
  mensagem: string
  link: string | null
  link_texto: string | null
}
const avisoFromRow = (r: AvisoRow): ChurchAviso => ({
  ativo: r.ativo,
  severidade: r.severidade,
  mensagem: r.mensagem,
  link: r.link,
  linkTexto: r.link_texto,
})

// ============================================================
// Defaults derivados de lib/data.ts (sem id real, só pro fallback)
// ============================================================

const DEFAULT_BANNERS: CmsBanner[] = defaultBanners.map((b, i) => ({
  id: `default-${i}`,
  title: b.title,
  subtitle: b.subtitle ?? null,
  imageUrl: b.imageUrl,
  buttonText: b.buttonText ?? null,
  link: b.link ?? null,
  sortOrder: i,
}))

const DEFAULT_MINISTERIOS: CmsMinisterio[] = defaultMinisterios.map((m, i) => ({
  id: m.id,
  name: m.name,
  description: m.description,
  imageUrl: m.imageUrl,
  leader: m.leader,
  leaderInstagram: m.leaderInstagram,
  sortOrder: i,
}))

const DEFAULT_EVENTOS: CmsEvento[] = defaultEventos.map((e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  date: e.date,
  time: e.time,
  location: e.location,
  category: e.category,
  imageUrl: e.imageUrl,
}))

// ============================================================
// READERS — Public (anon RLS-allowed)
// ============================================================

/**
 * Helper: tenta executar `fn` contra o cliente Supabase. Se o cliente não
 * existe (envs ausentes / build estático sem .env) ou se `fn` lançar,
 * cai no fallback. NUNCA quebra a renderização do site.
 */
async function safeRead<T>(fn: (sb: NonNullable<ReturnType<typeof createBrowserClient>>) => Promise<T>, fallback: T): Promise<T> {
  const sb = createBrowserClient()
  if (!sb) return fallback
  try {
    return await fn(sb)
  } catch {
    return fallback
  }
}

export async function getBanners(): Promise<CmsBanner[]> {
  return safeRead(async (sb) => {
    const { data, error } = await sb
      .from('cms_banners')
      .select('id,title,subtitle,image_url,button_text,link,sort_order')
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return DEFAULT_BANNERS
    return data.map(bannerFromRow)
  }, DEFAULT_BANNERS)
}

export async function getMinisterios(): Promise<CmsMinisterio[]> {
  return safeRead(async (sb) => {
    const { data, error } = await sb
      .from('cms_ministerios')
      .select('id,name,description,image_url,leader,leader_instagram,sort_order')
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return DEFAULT_MINISTERIOS
    return data.map(ministerioFromRow)
  }, DEFAULT_MINISTERIOS)
}

export async function getEventos(): Promise<CmsEvento[]> {
  return safeRead(async (sb) => {
    const { data, error } = await sb
      .from('cms_eventos')
      .select('id,title,description,date,time,location,category,image_url')
      .order('date', { ascending: true })
    if (error || !data || data.length === 0) return DEFAULT_EVENTOS
    return data.map(eventoFromRow)
  }, DEFAULT_EVENTOS)
}

export async function getTextos(): Promise<CmsTextos> {
  return safeRead(async (sb) => {
    const { data, error } = await sb
      .from('cms_textos')
      .select('key,value')
    if (error || !data || data.length === 0) return DEFAULT_TEXTOS
    const out: CmsTextos = { ...DEFAULT_TEXTOS }
    for (const row of data as Array<{ key: string; value: string }>) {
      out[row.key] = row.value
    }
    return out
  }, DEFAULT_TEXTOS)
}

export async function getAviso(): Promise<ChurchAviso> {
  return safeRead(async (sb) => {
    const { data, error } = await sb
      .from('cms_avisos')
      .select('id,ativo,severidade,mensagem,link,link_texto')
      .eq('id', 1)
      .maybeSingle()
    if (error || !data) return DEFAULT_AVISO
    return avisoFromRow(data as AvisoRow)
  }, DEFAULT_AVISO)
}

// ============================================================
// WRITERS — Authenticated (RLS força admin/conteudista)
// ============================================================

function writerClient() {
  const sb = createBrowserClient()
  if (!sb) {
    throw new Error('[cms] Supabase indisponível — confira NEXT_PUBLIC_SUPABASE_URL/PUBLISHABLE_KEY.')
  }
  return sb
}

// ---------- Banners ----------

export async function upsertBanner(banner: CmsBanner): Promise<CmsBanner> {
  const sb = writerClient()
  const isDefault = banner.id.startsWith('default-')
  const payload = bannerToRow(banner)
  if (isDefault) {
    const { data, error } = await sb
      .from('cms_banners')
      .insert(payload)
      .select('id,title,subtitle,image_url,button_text,link,sort_order')
      .single()
    if (error) throw error
    return bannerFromRow(data as BannerRow)
  } else {
    const { data, error } = await sb
      .from('cms_banners')
      .update(payload)
      .eq('id', banner.id)
      .select('id,title,subtitle,image_url,button_text,link,sort_order')
      .single()
    if (error) throw error
    return bannerFromRow(data as BannerRow)
  }
}

export async function createBanner(banner: Omit<CmsBanner, 'id'>): Promise<CmsBanner> {
  const sb = writerClient()
  const { data, error } = await sb
    .from('cms_banners')
    .insert(bannerToRow(banner))
    .select('id,title,subtitle,image_url,button_text,link,sort_order')
    .single()
  if (error) throw error
  return bannerFromRow(data as BannerRow)
}

export async function deleteBanner(id: string): Promise<void> {
  const sb = writerClient()
  const { error } = await sb.from('cms_banners').delete().eq('id', id)
  if (error) throw error
}

// ---------- Ministerios ----------

export async function upsertMinisterio(m: CmsMinisterio): Promise<CmsMinisterio> {
  const sb = writerClient()
  const isDefault = !/^[0-9a-f-]{36}$/i.test(m.id) // não-uuid → default seed
  const payload = ministerioToRow(m)
  if (isDefault) {
    const { data, error } = await sb
      .from('cms_ministerios')
      .insert(payload)
      .select('id,name,description,image_url,leader,leader_instagram,sort_order')
      .single()
    if (error) throw error
    return ministerioFromRow(data as MinisterioRow)
  } else {
    const { data, error } = await sb
      .from('cms_ministerios')
      .update(payload)
      .eq('id', m.id)
      .select('id,name,description,image_url,leader,leader_instagram,sort_order')
      .single()
    if (error) throw error
    return ministerioFromRow(data as MinisterioRow)
  }
}

export async function createMinisterio(m: Omit<CmsMinisterio, 'id'>): Promise<CmsMinisterio> {
  const sb = writerClient()
  const { data, error } = await sb
    .from('cms_ministerios')
    .insert(ministerioToRow(m))
    .select('id,name,description,image_url,leader,leader_instagram,sort_order')
    .single()
  if (error) throw error
  return ministerioFromRow(data as MinisterioRow)
}

export async function deleteMinisterio(id: string): Promise<void> {
  const sb = writerClient()
  const { error } = await sb.from('cms_ministerios').delete().eq('id', id)
  if (error) throw error
}

// ---------- Eventos ----------

export async function upsertEvento(e: CmsEvento): Promise<CmsEvento> {
  const sb = writerClient()
  const isDefault = !/^[0-9a-f-]{36}$/i.test(e.id)
  const payload = eventoToRow(e)
  if (isDefault) {
    const { data, error } = await sb
      .from('cms_eventos')
      .insert(payload)
      .select('id,title,description,date,time,location,category,image_url')
      .single()
    if (error) throw error
    return eventoFromRow(data as EventoRow)
  } else {
    const { data, error } = await sb
      .from('cms_eventos')
      .update(payload)
      .eq('id', e.id)
      .select('id,title,description,date,time,location,category,image_url')
      .single()
    if (error) throw error
    return eventoFromRow(data as EventoRow)
  }
}

export async function createEvento(e: Omit<CmsEvento, 'id'>): Promise<CmsEvento> {
  const sb = writerClient()
  const { data, error } = await sb
    .from('cms_eventos')
    .insert(eventoToRow(e))
    .select('id,title,description,date,time,location,category,image_url')
    .single()
  if (error) throw error
  return eventoFromRow(data as EventoRow)
}

export async function deleteEvento(id: string): Promise<void> {
  const sb = writerClient()
  const { error } = await sb.from('cms_eventos').delete().eq('id', id)
  if (error) throw error
}

// ---------- Textos ----------

export async function saveTextos(textos: CmsTextos): Promise<void> {
  const sb = writerClient()
  const rows = Object.entries(textos).map(([key, value]) => ({ key, value }))
  const { error } = await sb
    .from('cms_textos')
    .upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

// ---------- Avisos ----------

export async function saveAviso(aviso: ChurchAviso): Promise<void> {
  const sb = writerClient()
  const { error } = await sb.from('cms_avisos').upsert(
    {
      id: 1,
      ativo: aviso.ativo,
      severidade: aviso.severidade,
      mensagem: aviso.mensagem,
      link: aviso.link,
      link_texto: aviso.linkTexto,
    },
    { onConflict: 'id' }
  )
  if (error) throw error
}

// ============================================================
// IMAGE UPLOAD
// ============================================================

/**
 * Faz upload de um arquivo pra `public-images` bucket e retorna a URL
 * pública. Path: `cms/<timestamp>-<sanitized-filename>`.
 *
 * Precisa do user logado (RLS bloqueia upload anônimo).
 */
export async function uploadImage(file: File): Promise<string> {
  const sb = writerClient()
  const ts = Date.now()
  const safe = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
  const path = `cms/${ts}-${safe}`

  const { error: uploadErr } = await sb.storage
    .from('public-images')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
  if (uploadErr) throw uploadErr

  const { data } = sb.storage.from('public-images').getPublicUrl(path)
  return data.publicUrl
}
