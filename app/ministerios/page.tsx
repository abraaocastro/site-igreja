'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowUpRight } from 'lucide-react'
import { getMinisterios, type CmsMinisterio } from '@/lib/cms'
import { LeadersDisplay } from '@/components/leaders-popover'
import { SkeletonMinisterioCard } from '@/components/skeleton'
import { cn } from '@/lib/utils'

export default function MinisteriosPage() {
  const [ministerios, setMinisterios] = useState<CmsMinisterio[]>([])
  const [query, setQuery] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { let c = false; getMinisterios().then(r => { if (!c) { setMinisterios(r); setHydrated(true) } }); return () => { c = true } }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ministerios
    return ministerios.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
  }, [ministerios, query])

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Ministérios</div>
              <h1 className="display mb-5" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
                Encontre seu<br />lugar para <em className="text-brand-gradient">servir.</em>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Cada ministério é uma oportunidade de usar seus dons e talentos para a glória de Deus e o bem da comunidade.
              </p>
            </div>
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar ministério..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full h-[46px] pl-11 pr-4 rounded-full border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          {!hydrated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {[...Array(6)].map((_, i) => <SkeletonMinisterioCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">Nenhum ministério encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {filtered.map((m, i) => (
                <div key={m.id} id={m.id} className="group card-soft rounded-[22px] overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-3">
                    {m.imageUrl && (
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${m.imageUrl})` }} />
                    )}
                    {!m.imageUrl && <div className="absolute inset-0 ph-stripes" />}
                    <span className="absolute top-3.5 left-4 font-mono text-[11px] tracking-[.14em] text-foreground bg-background/[.92] px-2.5 py-1 rounded-full border border-border">
                      /{String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-[22px] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-2xl leading-[1.1] tracking-tight font-medium">{m.name}</h3>
                      <span className="w-9 h-9 rounded-full bg-surface-2 grid place-items-center shrink-0 group-hover:bg-foreground group-hover:text-background group-hover:-rotate-45 transition-all duration-200">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="text-[14px] text-muted-foreground leading-snug line-clamp-2">{m.description}</p>
                    <div className="pt-3 border-t border-border">
                      <LeadersDisplay leaders={m.leaders} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Quer <em className="italic">participar?</em></h2>
          <p className="text-muted-foreground max-w-[46ch] mx-auto mb-8">Entre em contato e descubra como você pode servir em um de nossos ministérios.</p>
          <Link href="/contato" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Fale conosco <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  )
}
