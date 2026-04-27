/**
 * robots.txt dinâmico.
 *
 * Permite indexação pública, **bloqueia** `/admin` e `/login` (telas
 * privadas que não devem aparecer em buscas) e aponta pra sitemap.
 */

import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://site-igreja-chi.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/admin/*', '/login'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
