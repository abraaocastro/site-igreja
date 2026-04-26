'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Users, UserCheck, ArrowRight, Heart, Music, Baby, Globe, BookOpen, HandHeart, Instagram } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { getMinisterios, type CmsMinisterio } from '@/lib/cms'

type MinisterioLike = CmsMinisterio

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Louvor e Adoração': Music,
  Infantil: Baby,
  Jovens: Users,
  Mulheres: Heart,
  Homens: HandHeart,
  Missões: Globe,
}

export default function MinisteriosPage() {
  const [ministerios, setMinisterios] = useState<MinisterioLike[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    getMinisterios().then((rows) => {
      if (!cancelled) setMinisterios(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ministerios
    return ministerios.filter(
      (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    )
  }, [ministerios, query])

  return (
    <div>
      <section className="relative bg-brand-gradient text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 h-96 w-96 bg-accent rounded-full blur-3xl -translate-x-1/2" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Nossos Ministérios
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Encontre um lugar para servir, crescer e fazer parte da família de Deus.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar ministério..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => {
              const Icon = ICONS[m.name] || BookOpen
              return (
                <article
                  key={m.id}
                  id={m.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover-lift"
                >
                  <div
                    className="relative h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${m.imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
                    <div className="absolute top-3 left-3 h-10 w-10 rounded-full bg-white/95 flex items-center justify-center text-primary shadow">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-serif font-bold text-white">{m.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                          <UserCheck className="h-3.5 w-3.5 text-primary" />
                          Líder: <strong className="truncate">{m.leader}</strong>
                        </span>
                        {m.leaderInstagram && (
                          <a
                            href={m.leaderInstagram}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition w-fit"
                            aria-label={`Instagram de ${m.leader}`}
                          >
                            <Instagram className="h-3 w-3" />
                            <span className="truncate">
                              {'@' + m.leaderInstagram.replace(/\/$/, '').split('/').pop()}
                            </span>
                          </a>
                        )}
                      </div>
                      <Link
                        href="/contato"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent-foreground hover:bg-accent px-2.5 py-1 rounded-full transition"
                      >
                        Participar
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">Nenhum ministério encontrado.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Como encontrar seu lugar"
            subtitle="Três passos simples para começar a servir"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: 1,
                title: 'Visite os ministérios',
                text: 'Participe das atividades e conheça os líderes para descobrir onde se encaixa melhor.',
              },
              {
                n: 2,
                title: 'Descubra seus dons',
                text: 'Deus preparou você com talentos únicos. Use-os para o Reino e para servir ao próximo.',
              },
              {
                n: 3,
                title: 'Comece a servir',
                text: 'Entre em contato com a liderança do ministério e dê o primeiro passo com alegria.',
              },
            ].map((s) => (
              <div key={s.n} className="bg-card rounded-xl p-6 border border-border shadow-sm hover-lift">
                <div className="h-12 w-12 rounded-full bg-brand-gradient-cyan text-white flex items-center justify-center font-bold text-lg">
                  {s.n}
                </div>
                <h3 className="mt-4 font-serif font-bold text-lg text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
