import type { Metadata } from 'next'
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AvisoBanner } from '@/components/aviso-banner'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'
import { getChurchJsonLd } from '@/lib/site-data'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Fraunces — títulos editoriais (substitui Merriweather)
// `axes` só é permitido com `weight: 'variable'`; deixamos fixos p/ ser mais previsível.
const fraunces = Fraunces({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

// Base do site para resolver URLs relativas em metadata (OG image, alternates).
// Em prod usa NEXT_PUBLIC_SITE_URL; fallback pra domínio Vercel atual.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://site-igreja-chi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Primeira Igreja Batista de Capim Grosso',
    template: '%s · Primeira Igreja Batista de Capim Grosso',
  },
  description:
    'Igreja Batista em Capim Grosso/BA. Cultos aos domingos 9h e 19h, quartas 19h30, sábados 19h30. Uma comunidade de fé, amor e esperança.',
  keywords: [
    'igreja batista',
    'igreja batista capim grosso',
    'pibac',
    'capim grosso',
    'igreja evangélica capim grosso',
    'comunidade cristã',
    'bahia',
    'piemonte da diamantina',
    'culto domingo capim grosso',
    'pastor silas barreto',
  ],
  authors: [{ name: 'Primeira Igreja Batista de Capim Grosso' }],
  creator: 'Primeira Igreja Batista de Capim Grosso',
  publisher: 'Primeira Igreja Batista de Capim Grosso',
  category: 'religion',
  applicationName: 'PIBAC',
  // Aplicado a páginas que não definirem o seu — admin/login sobrescrevem com noindex.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Primeira Igreja Batista de Capim Grosso',
    title: 'Primeira Igreja Batista de Capim Grosso',
    description:
      'Uma comunidade de fé, amor e esperança em Capim Grosso/BA. Venha nos conhecer.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Primeira Igreja Batista de Capim Grosso',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Primeira Igreja Batista de Capim Grosso',
    description:
      'Uma comunidade de fé, amor e esperança em Capim Grosso/BA.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  // Útil pra PWA / mobile add-to-home (caso futuro). Sem manifest.json não faz mal.
  manifest: undefined,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // JSON-LD Schema.org: ajuda o Google a entender a entidade (igreja + endereço +
  // pastor + redes sociais) e habilita o "knowledge panel" local.
  const jsonLd = getChurchJsonLd(siteUrl)

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} bg-background`}
    >
      <head>
        <script
          type="application/ld+json"
          // JSON.stringify é seguro aqui — o input vem 100% de data/church.json (confiável).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/* A11y: skip link só fica visível ao receber foco via teclado */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg"
        >
          Pular para o conteúdo principal
        </a>
        <AuthProvider>
          {/* Banner global de avisos (Phase 4). Self-renderiza null se inativo. */}
          <AvisoBanner />
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
