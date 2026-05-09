'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Informe seu e-mail.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error('Sistema indisponível. Tente mais tarde.')
        return
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${siteUrl}/login/nova-senha`,
      })

      if (error) {
        // Não revelar se o e-mail existe ou não (segurança)
        console.error('[recuperar] error:', error)
      }

      // Sempre mostra sucesso (mesmo se e-mail não existe — previne enumeração)
      setSent(true)
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
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

        {sent ? (
          /* Estado de sucesso */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/15 grid place-items-center mx-auto">
              <CheckCircle className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Verifique seu e-mail</h1>
            <p className="text-muted-foreground leading-relaxed max-w-[40ch] mx-auto">
              Se existe uma conta com o e-mail <strong className="text-foreground">{email}</strong>,
              enviamos um link para redefinir sua senha.
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique também a pasta de spam.
            </p>
            <div className="flex flex-col gap-2.5 pt-4">
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px] justify-center w-full"
              >
                Tentar outro e-mail
              </button>
              <Link href="/login" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px] justify-center w-full">
                Voltar ao login
              </Link>
            </div>
          </div>
        ) : (
          /* Formulário */
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-foreground">Recuperar senha</h1>
              <p className="text-muted-foreground mt-2">
                Informe o e-mail vinculado à sua conta e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="recovery-email" className="block text-sm font-medium text-foreground mb-1.5">
                  E-mail
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  <><Mail className="h-4 w-4" /> Enviar link de recuperação</>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Lembrou a senha?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">Entrar</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
