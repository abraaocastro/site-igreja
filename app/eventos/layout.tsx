import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos',
  description:
    'Cultos, conferências, batismos e atividades da Primeira Igreja Batista de Capim Grosso. Veja a programação completa.',
  alternates: { canonical: '/eventos' },
  openGraph: {
    title: 'Eventos · Primeira Igreja Batista de Capim Grosso',
    description: 'Cultos, conferências e atividades. Programação completa.',
    url: '/eventos',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
