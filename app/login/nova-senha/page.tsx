'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PasswordStrength } from '@/components/password-strength'
import { evaluatePassword } from '@/lib/password-strength'
import { toast } from 'sonner'

export default function NovaSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Supabase injeta a sessão automaticamente via hash fragment quando o
  // usuário clica no link de recuperação. Precisamos aguardar a sessão
  // ser restaurada antes de permitir a troca de senha.
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setError('Sistema indisponível.')
      return
    }

    // Escutar o evento PASSWORD_RECOVERY que o Supabase dispara
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // Também checar se já existe sessão (caso o evento já tenha disparado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const evaluation = evaluatePassword(password)
    if (!evaluation.acceptable) {
      toast.error('A senha não atende aos requisitos mínimos.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error('Sistema indisponível.')
        return
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      })

      if (updateErr) {
        toast.error(updateErr.message || 'Erro ao atualizar senha.')
        return
      }

      setSuccess(true)
      toast.success('Senha atualizada com sucesso!')

      // Redirecionar pro admin após 3 segundos
      setTimeout(() => router.push('/admin'), 3000)
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Voltar ao login
          </Link>
          <div className="relative h-10 w-10">
            <Image src="/logo.png" alt="Logo" fill sizes="40px" className="object-contain" />
          </div>
        </div>

        {error ? (
          /* Erro — link inválido ou expirado */
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-serif font-bold text-foreground">Link inválido</h1>
            <p className="text-muted-foreground">
              Este link de recuperação é inválido ou já expirou. Solicite um novo.
            </p>
            <Link href="/login/recuperar" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px] justify-center w-full">
              Solicitar novo link
            </Link>
          </div>
        ) : success ? (
          /* Sucesso */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/15 grid place-items-center mx-auto">
              <CheckCircle className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Senha atualizada!</h1>
            <p className="text-muted-foreground">
              Sua nova senha foi definida com sucesso. Redirecionando para o painel...
            </p>
            <Link href="/admin" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px] justify-center w-full">
              Ir para o painel
            </Link>
          </div>
        ) : !sessionReady ? (
          /* Aguardando sessão */
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-serif font-bold text-foreground">Verificando...</h1>
            <p className="text-muted-foreground">Validando seu link de recuperação.</p>
          </div>
        ) : (
          /* Formulário de nova senha */
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-foreground">Nova senha</h1>
              <p className="text-muted-foreground mt-2">
                Escolha uma senha forte para sua conta. Ela deve atender todos os requisitos abaixo.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Nova senha
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>

              <PasswordStrength
                password={password}
                onGenerate={(gen) => setPassword(gen)}
              />

              <button
                type="submit"
                disabled={loading || !evaluatePassword(password).acceptable}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  <><Lock className="h-4 w-4" /> Definir nova senha</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
