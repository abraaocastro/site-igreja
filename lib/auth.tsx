'use client'

/**
 * AuthProvider — camada de autenticação baseada em Supabase.
 *
 * Mantém a mesma API pública do mock anterior (`useAuth()` retornando
 * `{ user, loading, login, logout }`) pra que componentes existentes
 * funcionem sem alterações, mas agora atrás do Supabase Auth com sessão
 * persistida em cookies HTTP-only (segura, SSR-friendly).
 *
 * Conceitos importantes:
 *  - `user` é null até a primeira verificação de sessão terminar
 *  - `profile` vem da tabela public.profiles (role + nome)
 *  - `mustChangePassword` vira true se o admin foi criado via script com a
 *    flag `user_metadata.must_change_password = true` ainda pendente
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'conteudista'

export interface AuthProfile {
  id: string
  email: string
  nome: string | null
  role: UserRole
}

export interface AuthContextValue {
  user: User | null
  profile: AuthProfile | null
  loading: boolean
  mustChangePassword: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  /** Força releitura do profile (útil após troca de role ou nome). */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Uma única instância do cliente por provider (memoized via useState init).
  // Pode ser null se envs Supabase não estiverem configuradas (ex: build
  // estático sem .env.local). Nesse caso tudo fica em "deslogado".
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const mustChangePassword = Boolean(user?.user_metadata?.must_change_password)

  const fetchProfile = useCallback(
    async (userId: string): Promise<AuthProfile | null> => {
      if (!supabase) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nome, role')
        .eq('id', userId)
        .maybeSingle()
      if (error) {
        // Profile pode ainda não existir se a trigger de auto-create demorar.
        // Fallback: derivar do auth.user.
        return null
      }
      return data as AuthProfile | null
    },
    [supabase]
  )

  const hydrate = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setUser(null)
        setProfile(null)
        return
      }
      setUser(session.user)
      const p = await fetchProfile(session.user.id)
      setProfile(p)
    },
    [fetchProfile]
  )

  useEffect(() => {
    let active = true

    if (!supabase) {
      // Sem cliente (envs ausentes) → terminamos loading com user=null.
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      hydrate(session).finally(() => {
        if (active) setLoading(false)
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      hydrate(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, hydrate])

  const login = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return {
          ok: false,
          error:
            'Configuração do servidor incompleta. Avise a equipe técnica (envs do Supabase ausentes).',
        }
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) {
        // Mensagens traduzidas. Supabase retorna 'Invalid login credentials' etc.
        const msg =
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha inválidos.'
            : error.message === 'Email not confirmed'
              ? 'Confirme seu e-mail antes de entrar.'
              : error.message
        return { ok: false, error: msg }
      }
      if (data.session) {
        await hydrate(data.session)
      }
      return { ok: true }
    },
    [supabase, hydrate]
  )

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await fetchProfile(user.id)
    setProfile(p)
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, mustChangePassword, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
