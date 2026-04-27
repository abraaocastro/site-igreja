import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nossa Visão',
  description:
    'Missão, visão e propósito da Primeira Igreja Batista de Capim Grosso. Uma comunidade comprometida em fazer discípulos e transformar vidas.',
  alternates: { canonical: '/visao' },
  openGraph: {
    title: 'Nossa Visão · Primeira Igreja Batista de Capim Grosso',
    description: 'Missão, visão e propósito da PIBAC.',
    url: '/visao',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
