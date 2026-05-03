'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  Menu, X, ChevronDown, LogIn, LayoutDashboard, LogOut,
  Search, Moon, Sun, ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getMarca, DEFAULT_MARCA } from '@/lib/cms'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Quem somos', href: '/quem-somos', children: [
    { name: 'Quem Somos', href: '/quem-somos', desc: 'Nossa identidade e valores' },
    { name: 'Nossa História', href: '/historia', desc: 'Linha do tempo da PIBAC' },
    { name: 'Nossa Visão', href: '/visao', desc: 'Missão, visão e propósito' },
    { name: 'Conheça o Pastor', href: '/pastor', desc: 'Pr. Silas Barreto' },
  ]},
  { name: 'Ministérios', href: '/ministerios' },
  { name: 'Eventos', href: '/eventos' },
  { name: 'Devocional', href: '/plano-leitura' },
  { name: 'Contribua', href: '/contribua' },
]

const mobileLinks = [
  { name: 'Quem somos', href: '/quem-somos' },
  { name: 'Ministérios', href: '/ministerios' },
  { name: 'Eventos', href: '/eventos' },
  { name: 'Devocional', href: '/plano-leitura' },
  { name: 'Contribua', href: '/contribua' },
  { name: 'Contato', href: '/contato' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [userOpen, setUserOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [marca, setMarca] = useState({
    logo: DEFAULT_MARCA.marcaLogo,
    tituloPrincipal: DEFAULT_MARCA.marcaTituloPrincipal,
    subtitulo: DEFAULT_MARCA.marcaSubtitulo,
  })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { user, profile, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const displayName = profile?.nome || user?.email?.split('@')[0] || ''
  const displayInitial = (displayName || '?').charAt(0).toUpperCase()
  const displayRole = profile?.role ?? 'membro'

  useEffect(() => { getMarca().then(setMarca) }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem('pibac-theme') as 'light' | 'dark' | null
    const initial = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try { window.localStorage.setItem('pibac-theme', next) } catch {}
  }

  useEffect(() => {
    setMobileOpen(false); setOpenDrop(null); setUserOpen(false); setCmdOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(v => !v) }
      if (e.key === 'Escape') { setCmdOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href)
  const handleLogout = async () => { await logout(); setUserOpen(false); router.push('/') }

  return (
    <>
      {/* ── HEADER BAR ── */}
      <header className="nav sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl dark:bg-background/80">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10">
          <div className="flex h-[64px] lg:h-[76px] items-center justify-between gap-6">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
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
              <span className="hidden md:flex flex-col leading-tight">
                <span className="text-[14px] font-semibold text-foreground truncate">{marca.tituloPrincipal}</span>
                <span className="hidden xl:block text-[10px] text-muted-foreground tracking-wider uppercase truncate">{marca.subtitulo}</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1.5" aria-label="Principal">
              {navLinks.map(item => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div onMouseEnter={() => setOpenDrop(item.name)} onMouseLeave={() => setOpenDrop(null)}>
                      <button className={cn(
                        'nav-link h-[38px] px-3.5 inline-flex items-center gap-1.5 rounded-full text-[14px] transition-colors',
                        item.children.some(c => isActive(c.href)) ? 'text-foreground bg-surface-2' : 'text-foreground hover:bg-surface-2'
                      )}>
                        {item.name}
                        <ChevronDown className={cn('h-3 w-3 opacity-55 transition-transform', openDrop === item.name && 'rotate-180')} />
                      </button>
                      {openDrop === item.name && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-72 z-50 animate-fade-in">
                          <div className="rounded-2xl bg-card shadow-xl ring-1 ring-border p-2">
                            {item.children.map(child => (
                              <Link key={child.href} href={child.href}
                                className={cn('block px-3 py-2.5 rounded-xl text-sm transition-colors', isActive(child.href) ? 'bg-surface-2' : 'hover:bg-surface-2')}>
                                <span className="font-medium text-foreground">{child.name}</span>
                                {child.desc && <span className="block text-xs text-muted-foreground mt-0.5">{child.desc}</span>}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}
                      className={cn('nav-link h-[38px] px-3.5 inline-flex items-center rounded-full text-[14px] transition-colors',
                        isActive(item.href) ? 'text-foreground bg-surface-2' : 'text-foreground hover:bg-surface-2')}>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* ⌘K search */}
              <button onClick={() => setCmdOpen(true)}
                className="hidden md:inline-flex items-center gap-2.5 h-[38px] px-3 pr-3 rounded-full bg-surface-2 text-muted-foreground text-[13px] border border-transparent hover:border-border hover:text-foreground transition">
                <Search className="h-3.5 w-3.5" />
                <span>Buscar</span>
                <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-surface border border-border text-foreground">⌘K</kbd>
              </button>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="h-[38px] w-[38px] rounded-full hover:bg-surface-2 grid place-items-center transition" aria-label="Alternar tema">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserOpen(v => !v)}
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold hover:ring-2 hover:ring-accent transition">
                    {displayInitial}
                  </button>
                  {userOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card shadow-xl ring-1 ring-border py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-semibold truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <span className="mt-1 inline-block text-[10px] uppercase tracking-wider font-bold text-primary bg-accent/20 px-2 py-0.5 rounded">{displayRole}</span>
                        </div>
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-2">
                          <LayoutDashboard className="h-4 w-4" /> Painel de Conteúdo
                        </Link>
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5">
                          <LogOut className="h-4 w-4" /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {/* CTA */}
              <Link href="/contato" className="hidden md:inline-flex btn-primary h-[38px] px-4 text-[14px] rounded-full">
                Visite-nos
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              {/* Mobile toggle */}
              <button onClick={() => setMobileOpen(v => !v)}
                className="lg:hidden h-[42px] w-[42px] rounded-xl bg-surface-2 border border-border grid place-items-center hover:bg-surface-3 transition"
                aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}>
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU (full-screen drawer) ── */}
      <div className={cn(
        'fixed inset-0 z-[100] bg-background flex flex-col transition-transform duration-300 ease-out',
        mobileOpen ? 'translate-y-0 visible' : '-translate-y-full invisible'
      )} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src={marca.logo}
                alt={marca.tituloPrincipal}
                fill
                sizes="40px"
                className="object-contain"
                unoptimized={marca.logo.startsWith('http')}
              />
            </div>
            <span className="flex flex-col leading-tight">
              <span className="text-[14px] font-semibold">{marca.tituloPrincipal}</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">{marca.subtitulo}</span>
            </span>
          </Link>
          <button onClick={() => setMobileOpen(false)}
            className="h-[42px] w-[42px] rounded-xl bg-surface-2 border border-border grid place-items-center"
            aria-label="Fechar menu">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 flex flex-col gap-1 px-6 py-7 overflow-y-auto" aria-label="Menu mobile">
          {mobileLinks.map((item, i) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-[18px] border-b border-border font-serif text-[28px] tracking-tight leading-none">
              <span>{item.name}</span>
              <span className="font-mono text-[11px] tracking-[.14em] text-muted-foreground">/{String(i + 1).padStart(2, '0')}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom CTAs */}
        <div className="px-6 pb-8 pt-6 flex gap-2.5">
          {user ? (
            <>
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary justify-center rounded-full h-[46px]">
                <LayoutDashboard className="h-4 w-4" /> Painel
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }}
                className="flex-1 btn-ghost justify-center rounded-full h-[46px] text-destructive border-destructive/30">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/contato" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary justify-center rounded-full h-[46px]">Visite-nos</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-ghost justify-center rounded-full h-[46px]">Entrar</Link>
            </>
          )}
        </div>
      </div>

      {/* ── COMMAND PALETTE ── */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </>
  )
}

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
  const filtered = q ? items.filter(i => i.title.toLowerCase().includes(q.toLowerCase())) : items
  const grouped = filtered.reduce<Record<string, typeof items>>((acc, it) => { (acc[it.group] ||= []).push(it); return acc }, {})

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative mx-auto mt-[10vh] max-w-2xl rounded-2xl bg-card shadow-2xl ring-1 ring-border overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar ministério, evento, página…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted-foreground" />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 h-5 inline-flex items-center">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.keys(grouped).length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">Nada encontrado para &ldquo;{q}&rdquo;</div>
          )}
          {Object.entries(grouped).map(([group, arr]) => (
            <div key={group} className="mb-2">
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{group}</div>
              {arr.map(it => (
                <Link key={it.href} href={it.href} onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-surface-2 text-sm">
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
