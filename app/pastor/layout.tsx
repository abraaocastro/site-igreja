import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conheça o Pastor',
  description:
    'Pr. Silas Barreto, Pastor Presidente da Primeira Igreja Batista de Capim Grosso. Conheça quem lidera nossa comunidade.',
  alternates: { canonical: '/pastor' },
  openGraph: {
    title: 'Conheça o Pastor · Primeira Igreja Batista de Capim Grosso',
    description: 'Pr. Silas Barreto — Pastor Presidente da PIBAC.',
    url: '/pastor',
    type: 'profile',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
