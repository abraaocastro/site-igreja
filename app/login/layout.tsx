import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Área restrita para conteudistas e administradores.',
  // Login não deve aparecer no Google.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
