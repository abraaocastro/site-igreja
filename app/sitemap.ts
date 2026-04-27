/**
 * Sitemap dinâmico do site PIBAC.
 *
 * Lista as rotas públicas com prioridade e frequência razoáveis pra ajudar
 * o Google a entender a estrutura. `/admin` e `/login` ficam de fora — não
 * faz sentido indexar painel ou tela de login.
 *
 * Quando a URL final mudar (ex: domínio próprio pibac.com.br), basta setar
 * `NEXT_PUBLIC_SITE_URL` no Vercel — o sitemap pega automaticamente.
 */

import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://site-igreja-chi.vercel.app'

interface Route {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

// Rotas públicas, ordenadas por relevância. Home tem prioridade máxima.
const ROUTES: Route[] = [
  { path: '/',                changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/quem-somos',      changeFrequency: 'monthly', priority: 0.8 },
  { path: '/historia',        changeFrequency: 'yearly',  priority: 0.6 },
  { path: '/visao',           changeFrequency: 'yearly',  priority: 0.6 },
  { path: '/pastor',          changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ministerios',     changeFrequency: 'monthly', priority: 0.8 },
  { path: '/eventos',         changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/calendario',      changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/plano-leitura',   changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contribua',       changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contato',         changeFrequency: 'monthly', priority: 0.8 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
