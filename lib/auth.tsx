'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/*
 * ⚠️  AVISO DE SEGURANÇA
 *
 * Este é um sistema de autenticação 100% client-side, pensado como DEMO.
 * As credenciais viajam dentro do bundle JavaScript e podem ser lidas por
 * qualquer visitante do site via DevTools. NÃO use em produção.
 *
 * Para produção, substitua por um provedor real (NextAuth/Auth.js com
 * provider de e-mail/senha, Clerk, Supabase Auth, Firebase Auth, etc.) e
 * persista o conteúdo do CMS em um backend com autorização server-side.
 *
 * As credenciais padrão existem apenas para o primeiro acesso da equipe.
 * TROQUE-AS imediatamente ao ir pra produção, definindo variáveis:
 *   NEXT_PUBLIC_ADMIN_EMAIL
 *   NEXT_PUBLIC_ADMIN_PASSWORD
 * no arquivo `.env.local` (não versionado).
 */

interface AuthUser {
  email: string
  name: string
  role: 'conteudista' | 'admin'
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'pibac-auth'

const DEMO_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'conteudista@pibac.local'
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'trocar-esta-senha'

const DEMO_USERS: Array<{ email: string; password: string; name: string; role: AuthUser['role'] }> = [
  { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: 'Equipe de Conteúdo', role: 'conteudista' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!found) return { ok: false, error: 'E-mail ou senha inválidos.' }
    const next: AuthUser = { email: found.email, name: found.name, role: found.role }
    setUser(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
    return { ok: true }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
