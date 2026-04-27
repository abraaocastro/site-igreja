import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plano de Leitura Bíblica',
  description:
    'Plano de leitura bíblica de 30 dias da Primeira Igreja Batista de Capim Grosso. Mergulhe na Palavra com a comunidade.',
  alternates: { canonical: '/plano-leitura' },
  openGraph: {
    title: 'Plano de Leitura Bíblica · Primeira Igreja Batista de Capim Grosso',
    description: '30 dias na Palavra, conosco.',
    url: '/plano-leitura',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
