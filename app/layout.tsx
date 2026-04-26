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

export const metadata: Metadata = {
  title: 'Primeira Igreja Batista de Capim Grosso',
  description:
    'Bem-vindo à Primeira Igreja Batista de Capim Grosso. Uma comunidade de fé, amor e esperança. Venha nos conhecer!',
  keywords: ['igreja batista', 'capim grosso', 'igreja evangélica', 'comunidade cristã', 'bahia', 'pibac'],
  authors: [{ name: 'PIB Capim Grosso' }],
  openGraph: {
    title: 'Primeira Igreja Batista de Capim Grosso',
    description: 'Uma comunidade de fé, amor e esperança.',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // JSON-LD Schema.org: ajuda o Google a entender a entidade (igreja + endereço +
  // pastor + redes sociais) e habilita o "knowledge panel" local.
  // O siteUrl virá da env em produção; fallback pro domínio esperado.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pibac.vercel.app'
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
        <AuthProvider>
          {/* Banner global de avisos (Phase 4). Self-renderiza null se inativo. */}
          <AvisoBanner />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
