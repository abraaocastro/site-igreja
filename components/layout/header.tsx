'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, ChevronDown, LogIn, User, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Início', href: '/' },
  {
    name: 'Sobre Nós',
    href: '#',
    children: [
      { name: 'Quem Somos', href: '/quem-somos' },
      { name: 'Nossa História', href: '/historia' },
      { name: 'Nossa Visão', href: '/visao' },
      { name: 'Conheça o Pastor', href: '/pastor' },
    ],
  },
  { name: 'Ministérios', href: '/ministerios' },
  {
    name: 'Programação',
    href: '#',
    children: [
      { name: 'Eventos', href: '/eventos' },
      { name: 'Calendário', href: '/calendario' },
    ],
  },
  { name: 'Plano de Leitura', href: '/plano-leitura' },
  { name: 'Contribua', href: '/contribua' },
  { name: 'Contato', href: '/contato' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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

  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
    setUserMenuOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-card/95 backdrop-blur-md shadow-md border-border'
          : 'bg-card border-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-20 md:h-24 items-center justify-between gap-4 py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0">
              <Image
                src="/logo.png"
                alt="Primeira Igreja Batista de Capim Grosso"
                fill
                sizes="(min-width: 768px) 80px, 64px"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm md:text-base font-bold text-primary">Primeira Igreja Batista</p>
              <p className="text-xs text-muted-foreground tracking-wide uppercase">Capim Grosso</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex xl:items-center xl:gap-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                        item.children.some((c) => isActive(c.href))
                          ? 'text-primary bg-accent/10'
                          : 'text-foreground hover:text-primary hover:bg-muted'
                      )}
                    >
                      {item.name}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          openDropdown === item.name && 'rotate-180'
                        )}
                      />
                    </button>
                    {openDropdown === item.name && (
                      <div className="absolute left-0 top-full pt-2 w-52 z-50 animate-fade-in">
                        <div className="rounded-lg bg-card shadow-xl ring-1 ring-border py-2 overflow-hidden">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'block px-4 py-2.5 text-sm transition-colors border-l-2 border-transparent',
                                isActive(child.href)
                                  ? 'text-primary bg-accent/10 border-accent'
                                  : 'text-foreground hover:bg-muted hover:text-primary hover:border-accent'
                              )}
                            >
                              {child.name}
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
                      'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive(item.href)
                        ? 'text-primary bg-accent/10'
                        : 'text-foreground hover:text-primary hover:bg-muted'
                    )}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span className="absolute left-3 right-3 bottom-1 h-0.5 bg-accent rounded-full" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right side: auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border hover:border-accent hover:bg-muted transition-colors"
                  aria-label="Menu do usuário"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-gradient-cyan flex items-center justify-center text-white text-xs font-bold">
                    {displayInitial}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 rounded-lg bg-card shadow-xl ring-1 ring-border overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-border bg-muted">
                        <p className="text-sm font-semibold text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase tracking-wider font-bold text-primary bg-accent/20 px-2 py-0.5 rounded">
                          {displayRole}
                        </span>
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Painel de Conteúdo
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-md hover:shadow-primary/30"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="xl:hidden inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        className="flex w-full items-center justify-between px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      >
                        {item.name}
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 transition-transform',
                            openDropdown === item.name && 'rotate-180'
                          )}
                        />
                      </button>
                      {openDropdown === item.name && (
                        <div className="pl-4 border-l-2 border-accent/40 ml-3 mt-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-3 py-3 text-base font-medium rounded-md transition-colors',
                        isActive(item.href)
                          ? 'bg-accent/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="mt-3 pt-3 border-t border-border">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Painel ({displayName})
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-md"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md text-base font-medium hover:bg-primary/90"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
