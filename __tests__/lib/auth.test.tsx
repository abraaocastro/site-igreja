/**
 * Testes de `lib/auth.tsx` (AuthProvider + useAuth)
 *
 * Mocka o módulo `@/lib/supabase/client` pra controlar todas as respostas
 * do Supabase. Nenhum teste aqui toca a rede.
 *
 * Cobre:
 *  - useAuth lança erro fora do provider
 *  - loading fica true até a primeira getSession resolver
 *  - login traduz "Invalid login credentials" pra PT-BR
 *  - login OK → hydrate (user + profile)
 *  - mustChangePassword reflete user_metadata
 *  - logout limpa user/profile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@supabase/supabase-js'

// ---- Mock do cliente Supabase ----
// Definimos antes do import pra que o módulo seja hoisteado pelo Vitest.
const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockFromSelect = vi.fn()

const unsubscribe = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockFromSelect,
        }),
      }),
    }),
  }),
}))

// Importar DEPOIS do mock pra garantir hoisting correto
import { AuthProvider, useAuth } from '@/lib/auth'

// Pequeno componente que expõe o contexto pra asserts
function Probe() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user-email">{auth.user?.email ?? 'none'}</span>
      <span data-testid="profile-nome">{auth.profile?.nome ?? 'none'}</span>
      <span data-testid="must-change">{String(auth.mustChangePassword)}</span>
      <button
        onClick={async () => {
          await auth.login('ana@x.com', 'senha123')
        }}
      >
        login
      </button>
      <button
        onClick={async () => {
          await auth.logout()
        }}
      >
        logout
      </button>
    </div>
  )
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'ana@x.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  } as User
}

beforeEach(() => {
  mockSignInWithPassword.mockReset()
  mockSignOut.mockReset()
  mockGetSession.mockReset()
  mockOnAuthStateChange.mockReset()
  mockFromSelect.mockReset()

  // Default: sem sessão inicial
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe } },
  })
  mockSignOut.mockResolvedValue({ error: null })
  mockFromSelect.mockResolvedValue({ data: null, error: null })
})

describe('useAuth', () => {
  it('lança se usado fora do AuthProvider', () => {
    // Suprimir ruído do console.error padrão do React
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(
      /useAuth deve ser usado dentro de AuthProvider/
    )
    err.mockRestore()
  })
})

describe('AuthProvider — sessão inicial', () => {
  it('começa com loading=true e vira false depois de getSession resolver', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    // Pode começar true (antes do tick)
    expect(screen.getByTestId('loading').textContent).toBe('true')

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('user-email').textContent).toBe('none')
  })

  it('hidrata user + profile quando há sessão inicial', async () => {
    const user = makeUser({ user_metadata: { must_change_password: true } })
    mockGetSession.mockResolvedValue({
      data: { session: { user, access_token: 'x', refresh_token: 'y' } },
    })
    mockFromSelect.mockResolvedValue({
      data: { id: 'user-1', email: 'ana@x.com', nome: 'Ana', role: 'admin' },
      error: null,
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('user-email').textContent).toBe('ana@x.com')
    expect(screen.getByTestId('profile-nome').textContent).toBe('Ana')
    expect(screen.getByTestId('must-change').textContent).toBe('true')
  })
})

describe('AuthProvider — login', () => {
  it('traduz "Invalid login credentials" pra PT-BR', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    let result: { ok: boolean; error?: string } | undefined

    function Runner() {
      const { login, loading } = useAuth()
      return (
        <>
          <span data-testid="ready">{String(!loading)}</span>
          <button
            onClick={async () => {
              result = await login('a@b.com', 'bad')
            }}
          >
            go
          </button>
        </>
      )
    }

    render(
      <AuthProvider>
        <Runner />
      </AuthProvider>
    )

    // Espera o provider terminar a hidratação inicial
    await waitFor(() => {
      expect(screen.getByTestId('ready').textContent).toBe('true')
    })

    await act(async () => {
      await userEvent.click(screen.getByText('go'))
    })

    expect(result).toBeDefined()
    expect(result?.ok).toBe(false)
    expect(result?.error).toBe('E-mail ou senha inválidos.')
  })

  it('login OK hidrata user no estado', async () => {
    const user = makeUser()
    mockSignInWithPassword.mockResolvedValue({
      data: { user, session: { user, access_token: 'x', refresh_token: 'y' } },
      error: null,
    })
    mockFromSelect.mockResolvedValue({
      data: { id: 'user-1', email: 'ana@x.com', nome: 'Ana', role: 'admin' },
      error: null,
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await act(async () => {
      await userEvent.click(screen.getByText('login'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('ana@x.com')
    })
    expect(screen.getByTestId('profile-nome').textContent).toBe('Ana')
  })
})

describe('AuthProvider — logout', () => {
  it('limpa user + profile após signOut', async () => {
    const user = makeUser()
    mockGetSession.mockResolvedValue({
      data: { session: { user, access_token: 'x', refresh_token: 'y' } },
    })
    mockFromSelect.mockResolvedValue({
      data: { id: 'user-1', email: 'ana@x.com', nome: 'Ana', role: 'admin' },
      error: null,
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('ana@x.com')
    })

    await act(async () => {
      await userEvent.click(screen.getByText('logout'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('none')
    })
    expect(screen.getByTestId('profile-nome').textContent).toBe('none')
    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})
