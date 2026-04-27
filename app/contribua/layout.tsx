import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contribua',
  description:
    'Contribua com a obra da Primeira Igreja Batista de Capim Grosso. Dízimos, ofertas e missões via PIX, transferência ou presencial.',
  alternates: { canonical: '/contribua' },
  openGraph: {
    title: 'Contribua · Primeira Igreja Batista de Capim Grosso',
    description: 'Dízimos, ofertas e missões — cada semente transforma vidas.',
    url: '/contribua',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
