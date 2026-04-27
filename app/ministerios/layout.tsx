import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ministérios',
  description:
    'Ministérios da Primeira Igreja Batista de Capim Grosso: Louvor, Infantil, Jovens, Mulheres, Homens e Missões. Encontre seu lugar para servir.',
  alternates: { canonical: '/ministerios' },
  openGraph: {
    title: 'Ministérios · Primeira Igreja Batista de Capim Grosso',
    description: 'Encontre um lugar pra servir, crescer e fazer parte.',
    url: '/ministerios',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
