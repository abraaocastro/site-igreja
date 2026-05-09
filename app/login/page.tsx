'use client'

import { useState, FormEvent, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  useEffect(() => {
    if (!authLoading && user) router.replace('/admin')
  }, [user, authLoading, router])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Informe seu e-mail e senha.')
      return
    }
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) {
      toast.success('Login realizado com sucesso!')
      router.push('/admin')
    } else {
      toast.error(res.error || 'Falha no login')
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] grid lg:grid-cols-2">
      {/* Painel visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-brand-gradient text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute -top-20 -left-20 h-96 w-96 rounded-full blur-3xl"
            style={{ background: '#00C2FF' }}
          />
          <div
            className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
            style={{ background: '#0A2973' }}
          />
        </div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative h-20 w-20 bg-white rounded-full p-2 shrink-0">
              <Image src="/logo.png" alt="Logo PIBAC" fill sizes="80px" className="object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Área Restrita</h1>
              <p className="text-sm opacity-80">Equipe de conteúdo PIBAC</p>
            </div>
          </div>
          <p className="text-lg opacity-90 max-w-md leading-relaxed">
            Aqui você gerencia imagens dos cards, textos das páginas, eventos do
            calendário e todo o conteúdo editável do nosso site.
          </p>
          <ul className="mt-8 space-y-2 text-sm opacity-90">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Acesso protegido apenas para conteúdistas
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Atualize banners, datas e ministérios
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Preview em tempo real
            </li>
          </ul>
        </div>
        <div className="relative z-10">
          <blockquote className="italic opacity-85 text-sm border-l-2 border-accent pl-3 max-w-md">
            &ldquo;Tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor.&rdquo;
            <br />
            <span className="opacity-70">— Colossenses 3:23</span>
          </blockquote>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div className="relative h-12 w-12">
              <Image src="/logo.png" alt="Logo" fill sizes="48px" className="object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Entrar</h2>
            <p className="text-muted-foreground mt-2">
              Acesse o painel de gerenciamento do site.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">Lembrar-me</span>
              </label>
              <Link href="/login/recuperar" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-primary/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não possui acesso?{' '}
            <Link href="/contato" className="text-primary font-medium hover:underline">
              Fale com a secretaria
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
