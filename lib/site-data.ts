/**
 * site-data.ts — Reader tipado para os arquivos em /data.
 *
 * Fonte única de verdade para dados institucionais (endereço, contato,
 * socials, pastor, avisos). Componentes DEVEM consumir este módulo ao
 * invés de hard-codear strings.
 *
 * Guarda de segurança: valores marcados como `TODO-*` disparam warning em
 * dev e NÃO podem chegar em produção (helpers `requireNonTodo`).
 */

import churchData from '@/data/church.json'

// ---------- Types ----------

export interface ChurchAddress {
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface ChurchContact {
  telefone: string
  whatsapp: string
  email: string
}

export interface ChurchSocial {
  instagram: string
  instagramPastor: string
  instagramJovens: string
  facebook: string | null
  youtube: string | null
}

export interface ChurchPastor {
  nome: string
  titulo: string
  bio: string
  foto: string
  instagram: string | null
}

export type AvisoSeveridade = 'info' | 'atencao' | 'urgente'

export interface ChurchAviso {
  ativo: boolean
  severidade: AvisoSeveridade
  mensagem: string
  link: string | null
  linkTexto: string | null
}

export interface Church {
  nome: string
  nomeCurto: string
  slogan: string
  endereco: ChurchAddress
  contato: ChurchContact
  social: ChurchSocial
  pastor: ChurchPastor
  aviso: ChurchAviso
}

// ---------- Readers ----------

export function getChurch(): Church {
  return churchData as Church
}

// ---------- TODO guard ----------

/**
 * Verdadeiro se o valor é um placeholder não-preenchido (começa com "TODO").
 * Útil pra condicional de renderização enquanto o cliente não forneceu o dado.
 */
export function isTodo(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith('TODO')
}

/**
 * Retorna o valor se for real, ou `fallback` (default: string vazia) se for TODO.
 * Use em componentes para não renderizar "TODO-telefone" visível ao usuário.
 */
export function safeValue(value: string | null | undefined, fallback = ''): string {
  if (!value || isTodo(value)) return fallback
  return value
}

/**
 * Em produção, crashea se o valor ainda for TODO. Use em caminhos críticos
 * (ex: envio de formulário que exige email oficial). Em dev, só loga warning.
 */
export function requireNonTodo(value: string, fieldName: string): string {
  if (isTodo(value)) {
    const msg = `[site-data] Campo "${fieldName}" ainda está como TODO: "${value}". Preencha em data/church.json.`
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg)
    } else {
      // eslint-disable-next-line no-console
      console.warn(msg)
    }
  }
  return value
}

// ---------- Derived helpers ----------

/**
 * Endereço em linha única, para exibição compacta (ex: footer).
 * Se bairro ainda for TODO, omite.
 */
export function formatAddressOneLine(addr: ChurchAddress): string {
  const bairro = isTodo(addr.bairro) ? '' : ` - ${addr.bairro}`
  return `${addr.rua}, ${addr.numero}${bairro}, ${addr.cidade} - ${addr.estado}`
}

/**
 * Endereço em 2 linhas, para exibição com ícone (ex: contato).
 */
export function formatAddressTwoLines(addr: ChurchAddress): [string, string] {
  const bairro = isTodo(addr.bairro) ? '' : ` - ${addr.bairro}`
  return [
    `${addr.rua}, ${addr.numero}${bairro}`,
    `${addr.cidade} - ${addr.estado}, CEP ${addr.cep}`,
  ]
}

/**
 * Telefone formatado para display. Se TODO, retorna null.
 */
export function formatPhone(phone: string): string | null {
  if (isTodo(phone)) return null
  // aceita +5574... ou 74...
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13) {
    // +55 74 99999-9999
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return phone
}

/**
 * Link tel: pronto pra <a href>. Retorna null se TODO.
 */
export function telHref(phone: string): string | null {
  if (isTodo(phone)) return null
  const digits = phone.replace(/\D/g, '')
  return `tel:+${digits.length === 11 ? '55' : ''}${digits}`
}

/**
 * Link mailto:. Retorna null se TODO.
 */
export function mailtoHref(email: string): string | null {
  if (isTodo(email)) return null
  return `mailto:${email}`
}

// ---------- Google Maps helpers ----------

/**
 * String de busca do endereço, URL-encoded, pronta pra anexar em
 * URLs do Google Maps. Inclui nome da igreja pra ajudar o Maps a
 * casar com o ponto de interesse quando o endereço for novo no
 * índice. Omite bairro se ainda for TODO.
 *
 * Ex: "Primeira Igreja Batista de Capim Grosso, Rua Eldorado 30, Capim Grosso - BA, 44695-000"
 */
export function getMapsQuery(): string {
  const { nome, endereco } = getChurch()
  const bairro = isTodo(endereco.bairro) ? '' : ` - ${endereco.bairro}`
  const parts = [
    nome,
    `${endereco.rua}, ${endereco.numero}${bairro}`,
    `${endereco.cidade} - ${endereco.estado}`,
    endereco.cep,
  ]
  return encodeURIComponent(parts.join(', '))
}

/**
 * URL para o iframe de embed. Mapa estático centralizado no endereço.
 */
export function getMapsEmbedUrl(): string {
  return `https://www.google.com/maps?q=${getMapsQuery()}&output=embed`
}

/**
 * URL pra "Abrir no Google Maps" (pesquisa do local). Mobile abre o app
 * nativo; desktop abre em nova aba.
 */
export function getMapsSearchUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${getMapsQuery()}`
}

/**
 * URL pra "Como chegar" — abre o Maps já em modo rotas, com destino
 * preenchido e origem "minha localização".
 */
export function getMapsDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${getMapsQuery()}`
}

// ---------- Schema.org JSON-LD (SEO, base pra Phase 6) ----------

/**
 * Gera o objeto JSON-LD tipo "Church" pra injetar em <script type="application/ld+json">.
 * Ajuda o Google a entender que o site representa uma entidade física com endereço,
 * contato e presença em redes sociais — chave pro "knowledge panel" local.
 *
 * Valores TODO são omitidos pra não poluir o schema com lixo.
 */
export function getChurchJsonLd(siteUrl?: string): Record<string, unknown> {
  const { nome, endereco, contato, social, pastor } = getChurch()

  const sameAs = [
    social.instagram,
    social.instagramPastor,
    social.instagramJovens,
    social.facebook,
    social.youtube,
  ].filter((u): u is string => typeof u === 'string' && u.length > 0)

  const telephone = isTodo(contato.telefone) ? undefined : contato.telefone
  const email = isTodo(contato.email) ? undefined : contato.email
  const bairro = isTodo(endereco.bairro) ? undefined : endereco.bairro

  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: nome,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${endereco.rua}, ${endereco.numero}`,
      addressLocality: endereco.cidade,
      addressRegion: endereco.estado,
      postalCode: endereco.cep,
      addressCountry: 'BR',
      ...(bairro ? { addressArea: bairro } : {}),
    },
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    sameAs,
    employee: {
      '@type': 'Person',
      name: `${pastor.titulo} ${pastor.nome}`,
      jobTitle: pastor.titulo,
      ...(pastor.instagram ? { sameAs: [pastor.instagram] } : {}),
    },
  }
}
