'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  Menu, X, ChevronDown, LogIn, LayoutDashboard, LogOut,
  Search, Moon, Sun,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getMarca, DEFAULT_MARCA } from '@/lib/cms'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Início', href: '/' },
  {
    name: 'Sobre',
    href: '#',
    children: [
      { name: 'Quem Somos', href: '/quem-somos', desc: 'Nossa identidade e valores' },
      { name: 'Nossa História', href: '/historia', desc: 'Linha do tempo da PIBAC' },
      { name: 'Nossa Visão', href: '/visao', desc: 'Missão, visão e propósito' },
      { name: 'Conheça o Pastor', href: '/pastor', desc: 'Pr. Silas Barreto' },
    ],
  },
  { name: 'Ministérios', href: '/ministerios' },
  {
    name: 'Programação',
    href: '#',
    children: [
      { name: 'Eventos', href: '/eventos', desc: 'Próximos encontros' },
      { name: 'Calendário', href: '/calendario', desc: 'Calendário interativo' },
      { name: 'Plano de Leitura', href: '/plano-leitura', desc: '30 dias na Palavra' },
    ],
  },
  { name: 'Contribua', href: '/contribua' },
  { name: 'Contato', href: '/contato' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [userOpen, setUserOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [marca, setMarca] = useState<{
    logo: string
    tituloPrincipal: string
    subtitulo: string
  }>({
    logo: DEFAULT_MARCA.marcaLogo,
    tituloPrincipal: DEFAULT_MARCA.marcaTituloPrincipal,
    subtitulo: DEFAULT_MARCA.marcaSubtitulo,
  })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { user, profile, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Nome exibido vem do profile (tabela pública), com fallback pro prefixo
  // do e-mail caso o profile ainda não tenha carregado.
  const displayName = profile?.nome || user?.email?.split('@')[0] || ''
  const displayInitial = (displayName || '?').charAt(0).toUpperCase()
  const displayRole = profile?.role ?? 'membro'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hidrata marca do CMS (logo + nome customizáveis pelo admin)
  useEffect(() => {
    let cancelled = false
    getMarca().then((m) => {
      if (!cancelled) setMarca(m)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Tema: lê preferência do localStorage ou do sistema; aplica `.dark` no html
  useEffect(() => {
    const stored = window.localStorage.getItem('pibac-theme') as 'light' | 'dark' | null
    const initial: 'light' | 'dark' =
      stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = () => {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      window.localStorage.setItem('pibac-theme', next)
    } catch {
      // quota cheia/privacy mode — ignora
    }
  }

  useEffect(() => {
    setMobileOpen(false); setOpenDrop(null); setUserOpen(false); setCmdOpen(false)
  }, [pathname])

  // atalho ⌘K / Ctrl+K abre busca
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setCmdOpen((v) => !v)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href))

  const handleLogout = async () => {
    await logout()
    setUserOpen(false)
    router.push('/')
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border'
            : 'bg-background border-b border-transparent'
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 md:h-20 items-center justify-between gap-3">
            {/* Logo — sem fundo, apenas a imagem */}
            <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
              <div className="relative h-10 w-10 md:h-11 md:w-11 shrink-0">
                <Image
                  src={marca.logo}
                  alt={marca.tituloPrincipal}
                  fill
                  sizes="44px"
                  className="object-contain"
                  priority
                  unoptimized={marca.logo.startsWith('http')}
                />
              </div>
              {/* Texto da marca: aparece a partir de md, em xl ganha o subtítulo */}
              <div className="hidden md:flex md:flex-col md:leading-tight min-w-0">
                <p className="text-[14px] font-semibold text-foreground truncate">
                  {marca.tituloPrincipal}
                </p>
                <p className="hidden xl:block text-[10px] text-muted-foreground tracking-wider uppercase truncate">
                  {marca.subtitulo}
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden xl:flex xl:items-center xl:gap-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div
                      onMouseEnter={() => setOpenDrop(item.name)}
                      onMouseLeave={() => setOpenDrop(null)}
                    >
                      <button
                        className={cn(
                          'flex items-center gap-1 px-3 h-9 text-sm font-medium rounded-full transition-colors',
                          item.children.some((c) => isActive(c.href))
                            ? 'text-foreground bg-surface-2'
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                        )}
                      >
                        {item.name}
                        <ChevronDown
                          className={cn('h-3.5 w-3.5 transition-transform',
                            openDrop === item.name && 'rotate-180')}
                        />
                      </button>
                      {openDrop === item.name && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-80 z-50 animate-fade-in">
                          <div className="rounded-2xl bg-card shadow-xl ring-1 ring-border p-2 overflow-hidden">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  'flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors',
                                  isActive(child.href)
                                    ? 'bg-surface-2'
                                    : 'hover:bg-surface-2'
                                )}
                              >
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">{child.name}</div>
                                  {child.desc && (
                                    <div className="text-xs text-muted-foreground mt-0.5">{child.desc}</div>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'relative px-3 h-9 inline-flex items-center text-sm font-medium rounded-full transition-colors',
                        isActive(item.href)
                          ? 'text-foreground bg-surface-2'
                          : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Search trigger — só ícone até 2xl, ganha rótulo "Buscar" no 2xl+ */}
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-surface hover:bg-surface-2 text-muted-foreground text-sm transition-colors"
                aria-label="Buscar no site (Ctrl K)"
                title="Buscar (Ctrl K)"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="hidden 2xl:inline whitespace-nowrap">Buscar</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserOpen((v) => !v)}
                    className="flex items-center gap-1.5 pl-1 pr-2 h-9 rounded-full border border-border hover:bg-surface-2 transition-colors"
                    aria-label={`Menu da conta (${displayName})`}
                    title={displayName}
                  >
                    <div className="h-7 w-7 rounded-full bg-brand-gradient-cyan flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {displayInitial}
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', userOpen && 'rotate-180')} />
                  </button>
                  {userOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-card shadow-xl ring-1 ring-border overflow-hidden z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <span className="mt-1 inline-block text-[10px] uppercase tracking-wider font-bold text-primary bg-accent/20 px-2 py-0.5 rounded">
                            {displayRole}
                          </span>
                        </div>
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Painel de Conteúdo
                        </Link>
                        <button onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5">
                          <LogOut className="h-4 w-4" /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:inline-flex btn-ghost h-9 text-sm whitespace-nowrap"
                  aria-label="Entrar"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Entrar</span>
                </Link>
              )}

              <Link
                href="/contato"
                className="hidden md:inline-flex btn-primary h-9 text-sm whitespace-nowrap"
              >
                Visite-nos
              </Link>

              {/* Mobile button */}
              <button
                className="xl:hidden p-2 rounded-full hover:bg-surface-2"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="xl:hidden pb-4 border-t border-border animate-fade-in">
              <button
                onClick={() => { setMobileOpen(false); setCmdOpen(true) }}
                className="mt-4 w-full flex items-center gap-2 px-4 h-11 rounded-full border border-border text-muted-foreground"
              >
                <Search className="h-4 w-4" /> Buscar no site…
              </button>
              <div className="flex flex-col gap-1 mt-3 max-h-[70vh] overflow-y-auto">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <>
                        <button
                          className="flex w-full items-center justify-between px-3 py-3 text-base font-medium rounded-xl hover:bg-surface-2"
                          onClick={() => setOpenDrop(openDrop === item.name ? null : item.name)}
                        >
                          {item.name}
                          <ChevronDown className={cn('h-5 w-5 transition-transform', openDrop === item.name && 'rotate-180')} />
                        </button>
                        {openDrop === item.name && (
                          <div className="pl-4 ml-3 mt-1 border-l border-border">
                            {item.children.map((c) => (
                              <Link key={c.name} href={c.href}
                                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link href={item.href}
                        className={cn('block px-3 py-3 text-base font-medium rounded-xl',
                          isActive(item.href) ? 'bg-surface-2' : 'hover:bg-surface-2')}>
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                  {user ? (
                    <>
                      <Link href="/admin" className="flex-1 btn-ghost justify-center">
                        <LayoutDashboard className="h-4 w-4" /> Painel
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex-1 btn-ghost justify-center text-destructive border-destructive/30 hover:bg-destructive/5"
                      >
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex-1 btn-ghost justify-center">
                        <LogIn className="h-4 w-4" /> Entrar
                      </Link>
                      <Link href="/contato" className="flex-1 btn-primary justify-center">Visite-nos</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Command palette */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </>
  )
}

// ── Lightweight command palette / search
function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const items = [
    { group: 'Navegar', title: 'Início', href: '/' },
    { group: 'Navegar', title: 'Quem Somos', href: '/quem-somos' },
    { group: 'Navegar', title: 'Ministérios', href: '/ministerios' },
    { group: 'Navegar', title: 'Eventos', href: '/eventos' },
    { group: 'Navegar', title: 'Calendário', href: '/calendario' },
    { group: 'Navegar', title: 'Pastor Silas', href: '/pastor' },
    { group: 'Ações', title: 'Plano de Leitura', href: '/plano-leitura' },
    { group: 'Ações', title: 'Contribuir / Pix', href: '/contribua' },
    { group: 'Ações', title: 'Falar conosco', href: '/contato' },
  ]
  const filtered = q
    ? items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()))
    : items
  const grouped = filtered.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.group] ||= []).push(it); return acc
  }, {})

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative mx-auto mt-[10vh] max-w-2xl rounded-2xl bg-card shadow-2xl ring-1 ring-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ministério, evento, página…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 h-5 inline-flex items-center">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.entries(grouped).length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nada encontrado para &ldquo;{q}&rdquo;
            </div>
          )}
          {Object.entries(grouped).map(([group, arr]) => (
            <div key={group} className="mb-2">
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {arr.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-surface-2 text-sm"
                >
                  <span className="flex-1">{it.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
