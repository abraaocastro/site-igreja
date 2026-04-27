import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nossa História',
  description:
    'Mais de 50 anos de fé, amor e serviço. Conheça a trajetória da Primeira Igreja Batista de Capim Grosso, desde a fundação em 1972 até hoje.',
  alternates: { canonical: '/historia' },
  openGraph: {
    title: 'Nossa História · Primeira Igreja Batista de Capim Grosso',
    description: 'Trajetória da PIBAC desde a fundação.',
    url: '/historia',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
