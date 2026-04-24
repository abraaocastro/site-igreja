'use client'

/**
 * /admin/primeiro-acesso — força a troca da senha no primeiro login.
 *
 * Fluxo:
 *  1. Middleware já garante que só chega aqui quem tem `must_change_password: true`
 *     (ou é redirecionado pra /admin se já trocou)
 *  2. Usuário preenche nova senha + confirmação com medidor ao vivo
 *  3. Validamos: senha aceitável (score ≥ 3 + checklist) E diferente da anterior
 *  4. `supabase.auth.updateUser({ password, data: { must_change_password: false } })`
 *  5. Após sucesso: toast + `refreshProfile` + `router.push('/admin')`
 *
 * Nota: a sessão só foi emitida porque o admin fez login com a senha
 * temporária, então o reauth forçado pelo Supabase em updateUser não é
 * necessário aqui — a própria sessão autoriza a troca.
 */

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShieldCheck, Loader2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { evaluatePassword } from '@/lib/password-strength'
import { PasswordStrength } from '@/components/password-strength'
import { cn } from '@/lib/utils'

export default function PrimeiroAcessoPage() {
  const { user, loading, mustChangePassword, refreshProfile } = useAuth()
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Se alguém cair aqui sem sessão → /login. Se já trocou → /admin.
  // Middleware já cobre isso, mas esse guard client-side é UX (evita flicker).
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!mustChangePassword) {
      router.replace('/admin')
    }
  }, [loading, user, mustChangePassword, router])

  const userInputs = user
    ? [user.email || '', (user.user_metadata?.nome as string) || ''].filter(Boolean)
    : []

  const evaluation = evaluatePassword(password, userInputs)

  const handleGenerated = (generated: string) => {
    setPassword(generated)
    setConfirm(generated)
    // Copia pro clipboard pra facilitar anotar no gerenciador de senhas
    try {
      navigator.clipboard?.writeText(generated)
      setCopied(true)
      toast.success('Senha gerada e copiada!', {
        description: 'Cole no seu gerenciador de senhas antes de continuar.',
      })
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.success('Senha gerada!', { description: 'Anote num local seguro.' })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success('Senha copiada!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!evaluation.acceptable) {
      toast.error('A senha ainda não atende aos requisitos.', {
        description: evaluation.issues[0],
      })
      return
    }
    if (password !== confirm) {
      toast.error('As senhas não conferem.')
      return
    }

    if (!supabase) {
      toast.error('Configuração ausente. Avise a equipe técnica.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    })
    setSubmitting(false)

    if (error) {
      // Caso clássico: "New password should be different from the old password."
      const msg =
        error.message === 'New password should be different from the old password.'
          ? 'A nova senha precisa ser diferente da temporária.'
          : error.message
      toast.error('Não foi possível trocar a senha', { description: msg })
      return
    }

    toast.success('Senha atualizada com sucesso!', {
      description: 'Bem-vindo(a) ao painel.',
    })
    await refreshProfile()
    router.replace('/admin')
  }

  if (loading || !user || !mustChangePassword) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const passwordsMatch = confirm.length > 0 && password === confirm
  const passwordsMismatch = confirm.length > 0 && password !== confirm

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-muted/30 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-brand-gradient text-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 bg-white rounded-full p-1.5 shrink-0">
                <Image src="/logo.png" alt="Logo PIBAC" fill sizes="56px" className="object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-0.5">
                  Primeiro acesso
                </p>
                <h1 className="text-xl sm:text-2xl font-serif font-bold">
                  Crie uma senha forte
                </h1>
                <p className="text-sm opacity-85 mt-1">
                  Antes de entrar no painel, escolha uma senha só sua.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-foreground">
                <p className="font-medium">Por que isso é obrigatório?</p>
                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                  A senha temporária foi criada por outra pessoa e pode ter sido
                  vista. Trocar agora garante que só você tem acesso à sua conta.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {/* E-mail (readonly — informativo) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Conta
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-md border border-input bg-muted text-muted-foreground"
                />
              </div>

              {/* Nova senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="Digite ou gere uma senha forte"
                    className="w-full px-4 py-3 pr-24 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {password.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1.5 text-muted-foreground hover:text-foreground"
                        aria-label="Copiar senha"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Medidor + checklist + gerador */}
              <PasswordStrength
                password={password}
                userInputs={userInputs}
                onGenerate={handleGenerated}
              />

              {/* Confirmação */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirme a nova senha
                </label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-md border bg-background focus:outline-none focus:ring-2 transition',
                    passwordsMismatch
                      ? 'border-red-500 focus:ring-red-500/40'
                      : passwordsMatch
                        ? 'border-green-500 focus:ring-green-500/40'
                        : 'border-input focus:ring-ring'
                  )}
                />
                {passwordsMismatch && (
                  <p className="mt-1 text-xs text-red-600">As senhas não conferem.</p>
                )}
                {passwordsMatch && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Senhas idênticas.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !evaluation.acceptable || !passwordsMatch}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-primary/30"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Salvar senha e entrar
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dica: anote sua senha num gerenciador como Bitwarden, 1Password ou
          o próprio navegador. Se esquecer, um admin precisa gerar uma nova.
        </p>
      </div>
    </div>
  )
}
