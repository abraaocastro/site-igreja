import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendário',
  description:
    'Calendário interativo da Primeira Igreja Batista de Capim Grosso. Veja cultos, encontros e eventos especiais mês a mês.',
  alternates: { canonical: '/calendario' },
  openGraph: {
    title: 'Calendário · Primeira Igreja Batista de Capim Grosso',
    description: 'Veja cultos, encontros e eventos mês a mês.',
    url: '/calendario',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
