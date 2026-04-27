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
import {
  getChurch as getChurchStatic,
  type Church,
  type ChurchAviso,
  type AvisoSeveridade,
  type PixTipo,
} from '@/lib/site-data'

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

export interface CmsHistoriaEntry {
  id: string
  year: string
  title: string
  description: string
  imageUrl: string | null
  sortOrder: number
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

interface HistoriaRow {
  id: string
  year: string
  title: string
  description: string
  image_url: string | null
  sort_order: number
}
const historiaFromRow = (r: HistoriaRow): CmsHistoriaEntry => ({
  id: r.id,
  year: r.year,
  title: r.title,
  description: r.description,
  imageUrl: r.image_url,
  sortOrder: r.sort_order,
})
const historiaToRow = (h: Partial<CmsHistoriaEntry>): Partial<HistoriaRow> => ({
  ...(h.year !== undefined && { year: h.year }),
  ...(h.title !== undefined && { title: h.title }),
  ...(h.description !== undefined && { description: h.description }),
  ...(h.imageUrl !== undefined && { image_url: h.imageUrl }),
  ...(h.sortOrder !== undefined && { sort_order: h.sortOrder }),
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

// Defaults da timeline /historia — derivados do que vivia em app/historia/page.tsx.
const DEFAULT_HISTORIA: CmsHistoriaEntry[] = [
  { year: '1970', title: 'A Semente é Plantada', description: 'Um pequeno grupo de famílias começou a se reunir em uma casa para estudar a Bíblia e orar. A semente do Evangelho foi plantada em Capim Grosso.', imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80', sortOrder: 0 },
  { year: '1972', title: 'Organização da Igreja', description: 'Com o crescimento do grupo, a igreja foi oficialmente organizada como Primeira Igreja Batista de Capim Grosso, filiada à Convenção Batista Brasileira.', imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80', sortOrder: 1 },
  { year: '1980', title: 'Construção do Templo', description: 'Através de muito esforço e dedicação dos membros, foi construído o primeiro templo da igreja, um marco na história da congregação.', imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', sortOrder: 2 },
  { year: '1995', title: 'Expansão dos Ministérios', description: 'A igreja expandiu seus ministérios, criando trabalhos específicos para jovens, crianças, mulheres e homens, fortalecendo a comunidade.', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', sortOrder: 3 },
  { year: '2005', title: 'Ampliação do Templo', description: 'Com o crescimento contínuo, o templo foi ampliado para acomodar mais pessoas e criar novos espaços para atividades da igreja.', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', sortOrder: 4 },
  { year: '2015', title: 'Centro de Educação Cristã', description: 'Foi inaugurado o Centro de Educação Cristã, oferecendo espaço para Escola Bíblica Dominical e treinamento de líderes.', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', sortOrder: 5 },
  { year: '2020', title: 'Igreja Online', description: 'Durante a pandemia, a igreja se adaptou e começou a transmitir cultos online, alcançando pessoas além das fronteiras da cidade.', imageUrl: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600&q=80', sortOrder: 6 },
  { year: 'Hoje', title: 'Continuando a Missão', description: 'Hoje, a PIB Capim Grosso continua firme em sua missão, com centenas de membros, diversos ministérios ativos e projetos sociais na comunidade.', imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80', sortOrder: 7 },
].map((h, i) => ({ ...h, id: `default-${i}` }))

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

export async function getHistoria(): Promise<CmsHistoriaEntry[]> {
  return safeRead(async (sb) => {
    const { data, error } = await sb
      .from('cms_historia')
      .select('id,year,title,description,image_url,sort_order')
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return DEFAULT_HISTORIA
    return data.map(historiaFromRow)
  }, DEFAULT_HISTORIA)
}

// ============================================================
// CHURCH (textos KV overrides em cima de data/church.json)
// ============================================================
//
// Phase 9: o admin pode editar endereço/contato/socials/pastor/pix sem
// commitar JSON. As chaves vivem em `cms_textos` (KV) e fazem override
// dos valores estáticos. Quando o valor no banco é vazio/ausente, cai
// pro default em data/church.json.

/**
 * Lista de chaves do `cms_textos` que mapeiam pra campos da Igreja.
 * Usada pelo admin pra renderizar os formulários "Igreja" e "Pastor".
 */
export const CHURCH_TEXTOS_KEYS = {
  marca: ['marcaLogo', 'marcaTituloPrincipal', 'marcaSubtitulo'] as const,
  igreja: ['igrejaNome', 'igrejaNomeCurto', 'igrejaSlogan'] as const,
  endereco: ['enderecoRua', 'enderecoNumero', 'enderecoBairro', 'enderecoCidade', 'enderecoEstado', 'enderecoCep'] as const,
  contato: ['contatoTelefone', 'contatoWhatsapp', 'contatoEmail'] as const,
  social: ['socialInstagram', 'socialInstagramPastor', 'socialInstagramJovens', 'socialFacebook', 'socialYoutube'] as const,
  pastor: ['pastorNome', 'pastorTitulo', 'pastorBio', 'pastorFoto', 'pastorInstagram'] as const,
  pix: ['pixChave', 'pixTipo', 'pixTitular'] as const,
  historia: ['historiaIntroTitulo', 'historiaIntroSubtitulo', 'historiaIntroTexto', 'historiaCitacao', 'historiaCitacaoRef', 'historiaCitacaoTexto'] as const,
} as const

/**
 * Defaults da marca (logo + textos do logotipo). Usados no Header/Footer
 * com fallback se admin ainda não personalizou.
 */
export const DEFAULT_MARCA = {
  marcaLogo: '/logo.png',
  marcaTituloPrincipal: 'PIB Capim Grosso',
  marcaSubtitulo: 'Desde 1978 · Bahia',
} as const

/**
 * Lê os 3 campos de marca já com fallback aos defaults. Conveniente pra
 * Header/Footer que só querem esse subset (e não o `Church` inteiro).
 */
export async function getMarca(): Promise<{
  logo: string
  tituloPrincipal: string
  subtitulo: string
}> {
  const textos = await getTextos()
  return {
    logo: pickMarca(textos['marcaLogo'], DEFAULT_MARCA.marcaLogo),
    tituloPrincipal: pickMarca(textos['marcaTituloPrincipal'], DEFAULT_MARCA.marcaTituloPrincipal),
    subtitulo: pickMarca(textos['marcaSubtitulo'], DEFAULT_MARCA.marcaSubtitulo),
  }
}

function pickMarca(value: string | undefined, fallback: string): string {
  if (value === undefined || value === null) return fallback
  const trimmed = String(value).trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'null') return fallback
  return trimmed
}

type AnyTextoKey =
  | (typeof CHURCH_TEXTOS_KEYS.igreja)[number]
  | (typeof CHURCH_TEXTOS_KEYS.endereco)[number]
  | (typeof CHURCH_TEXTOS_KEYS.contato)[number]
  | (typeof CHURCH_TEXTOS_KEYS.social)[number]
  | (typeof CHURCH_TEXTOS_KEYS.pastor)[number]
  | (typeof CHURCH_TEXTOS_KEYS.pix)[number]
  | (typeof CHURCH_TEXTOS_KEYS.historia)[number]

/**
 * Helper interno: pega o valor da chave OU o fallback se a chave estiver
 * vazia/ausente. Trata `'null'` (string literal) como ausência.
 */
function pick(textos: CmsTextos, key: AnyTextoKey, fallback: string): string {
  const v = textos[key]
  if (v === undefined || v === null) return fallback
  const trimmed = String(v).trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'null') return fallback
  return trimmed
}
function pickNullable(textos: CmsTextos, key: AnyTextoKey, fallback: string | null): string | null {
  const v = textos[key]
  if (v === undefined || v === null) return fallback
  const trimmed = String(v).trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'null') return null
  return trimmed
}

/**
 * Retorna o `Church` efetivo: defaults de `data/church.json` com qualquer
 * override que o admin tenha gravado em `cms_textos`. Não toca `aviso` —
 * isso vive em `cms_avisos` (use `getAviso()` separadamente).
 *
 * Use em páginas client: `useEffect(() => getChurchEffective().then(set))`.
 */
export async function getChurchEffective(): Promise<Church> {
  const base = getChurchStatic()
  const textos = await getTextos()

  const bioRaw = textos['pastorBio']
  const bio = bioRaw && bioRaw.trim()
    ? bioRaw.split(/\n{2,}|\r\n{2}/).map((p) => p.trim()).filter(Boolean)
    : base.pastor.bio

  return {
    nome:      pick(textos, 'igrejaNome',      base.nome),
    nomeCurto: pick(textos, 'igrejaNomeCurto', base.nomeCurto),
    slogan:    pick(textos, 'igrejaSlogan',    base.slogan),
    endereco: {
      rua:     pick(textos, 'enderecoRua',     base.endereco.rua),
      numero:  pick(textos, 'enderecoNumero',  base.endereco.numero),
      bairro:  pick(textos, 'enderecoBairro',  base.endereco.bairro),
      cidade:  pick(textos, 'enderecoCidade',  base.endereco.cidade),
      estado:  pick(textos, 'enderecoEstado',  base.endereco.estado),
      cep:     pick(textos, 'enderecoCep',     base.endereco.cep),
    },
    contato: {
      telefone: pickNullable(textos, 'contatoTelefone', base.contato.telefone),
      whatsapp: pickNullable(textos, 'contatoWhatsapp', base.contato.whatsapp),
      email:    pickNullable(textos, 'contatoEmail',    base.contato.email),
    },
    social: {
      instagram:        pick(textos, 'socialInstagram',        base.social.instagram),
      instagramPastor:  pick(textos, 'socialInstagramPastor',  base.social.instagramPastor),
      instagramJovens:  pick(textos, 'socialInstagramJovens',  base.social.instagramJovens),
      facebook:         pickNullable(textos, 'socialFacebook', base.social.facebook),
      youtube:          pickNullable(textos, 'socialYoutube',  base.social.youtube),
    },
    pastor: {
      nome:      pick(textos, 'pastorNome',      base.pastor.nome),
      titulo:    pick(textos, 'pastorTitulo',    base.pastor.titulo),
      bio,
      foto:      pick(textos, 'pastorFoto',      base.pastor.foto),
      instagram: pickNullable(textos, 'pastorInstagram', base.pastor.instagram),
    },
    pix: {
      chave:   pick(textos, 'pixChave',   base.pix.chave),
      tipo:    (pick(textos, 'pixTipo', base.pix.tipo) as PixTipo),
      titular: pick(textos, 'pixTitular', base.pix.titular),
    },
    aviso: base.aviso,
  }
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

// ---------- Historia (Phase 9) ----------

export async function createHistoria(h: Omit<CmsHistoriaEntry, 'id'>): Promise<CmsHistoriaEntry> {
  const sb = writerClient()
  const { data, error } = await sb
    .from('cms_historia')
    .insert(historiaToRow(h))
    .select('id,year,title,description,image_url,sort_order')
    .single()
  if (error) throw error
  return historiaFromRow(data as HistoriaRow)
}

export async function upsertHistoria(h: CmsHistoriaEntry): Promise<CmsHistoriaEntry> {
  const sb = writerClient()
  const isDefault = !/^[0-9a-f-]{36}$/i.test(h.id)
  const payload = historiaToRow(h)
  if (isDefault) {
    const { data, error } = await sb
      .from('cms_historia')
      .insert(payload)
      .select('id,year,title,description,image_url,sort_order')
      .single()
    if (error) throw error
    return historiaFromRow(data as HistoriaRow)
  } else {
    const { data, error } = await sb
      .from('cms_historia')
      .update(payload)
      .eq('id', h.id)
      .select('id,year,title,description,image_url,sort_order')
      .single()
    if (error) throw error
    return historiaFromRow(data as HistoriaRow)
  }
}

export async function deleteHistoria(id: string): Promise<void> {
  const sb = writerClient()
  const { error } = await sb.from('cms_historia').delete().eq('id', id)
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
