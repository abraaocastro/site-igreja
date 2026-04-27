import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel',
  description: 'Painel de conteúdo da Primeira Igreja Batista de Capim Grosso.',
  // Toda /admin/* fica fora da indexação.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
