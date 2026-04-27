import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a Primeira Igreja Batista de Capim Grosso. Endereço, telefone, WhatsApp, e-mail e como chegar. Localizada na Rua Eldorado, 30 — Capim Grosso/BA.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato · Primeira Igreja Batista de Capim Grosso',
    description: 'Endereço, telefone, WhatsApp e como chegar.',
    url: '/contato',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
