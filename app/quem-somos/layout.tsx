import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description:
    'Conheça a identidade, valores e missão da Primeira Igreja Batista de Capim Grosso. Uma comunidade de fé fundamentada na Palavra, comprometida com o evangelho e com o cuidado mútuo.',
  alternates: { canonical: '/quem-somos' },
  openGraph: {
    title: 'Quem Somos · Primeira Igreja Batista de Capim Grosso',
    description: 'Identidade, valores e missão da PIBAC.',
    url: '/quem-somos',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
