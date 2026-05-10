'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ArrowUpRight } from 'lucide-react'
import { getEventos, type CmsEvento } from '@/lib/cms'
import { SkeletonEventoRow } from '@/components/skeleton'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<CmsEvento[]>([])
  const [categoria, setCategoria] = useState('todas')
  const [view, setView] = useState<'proximos' | 'passados'>('proximos')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { let c = false; getEventos().then(r => { if (!c) { setEventos(r); setHydrated(true) } }); return () => { c = true } }, [])

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const categorias = useMemo(() => ['todas', ...Array.from(new Set(eventos.map(e => e.category)))], [eventos])

  const filtered = useMemo(() => {
    let list = eventos.filter(e => {
      const d = parseLocalDate(e.date)
      return view === 'proximos' ? d >= today : d < today
    })
    if (categoria !== 'todas') list = list.filter(e => e.category === categoria)
    list.sort((a, b) => view === 'proximos'
      ? (a.date + a.time).localeCompare(b.date + b.time)
      : (b.date + b.time).localeCompare(a.date + a.time))
    return list
  }, [eventos, view, categoria, today])

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-3xl">
            <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Programação</div>
            <h1 className="display mb-5" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              Eventos e<br /><em className="text-brand-gradient">celebrações.</em>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[52ch]">
              Encontros, celebrações e formações abertas à comunidade de Capim Grosso e região.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-10">
            <div className="flex p-1.5 bg-surface-2 rounded-full">
              {['proximos', 'passados'].map(v => (
                <button key={v} onClick={() => setView(v as typeof view)}
                  className={cn('h-[36px] px-4 rounded-full text-[13px] font-medium transition-all border-0 cursor-pointer',
                    view === v ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                  {v === 'proximos' ? 'Próximos' : 'Passados'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-surface-2 rounded-full">
              {categorias.map(c => (
                <button key={c} onClick={() => setCategoria(c)}
                  className={cn('h-[36px] px-3.5 rounded-full text-[12px] font-medium transition-all border-0 cursor-pointer capitalize',
                    categoria === c ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                  {c === 'todas' ? 'Todas' : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          {!hydrated ? (
            <div className="border-t border-border">
              {[...Array(3)].map((_, i) => <SkeletonEventoRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {view === 'proximos' ? 'Nenhum evento agendado.' : 'Nenhum evento passado encontrado.'}
            </div>
          ) : (
            <div className="border-t border-border">
              {filtered.map(e => {
                const d = parseISO(e.date)
                return (
                  <div key={e.id} id={e.id}
                    className="group grid grid-cols-1 md:grid-cols-[120px_1fr_200px_50px] gap-4 md:gap-6 py-7 border-b border-border items-start md:items-center hover:pl-3 transition-all">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif tabular-nums leading-[0.85] tracking-tight text-[clamp(40px,6vw,64px)]">{format(d, 'dd')}</span>
                      <span className="font-mono text-[10px] tracking-[.18em] text-accent uppercase">
                        {format(d, 'MMM', { locale: ptBR }).replace('.', '')}<br />{format(d, 'yyyy')}
                      </span>
                    </div>
                    <div>
                      <div className="font-serif leading-[1.05] tracking-tight text-[clamp(20px, 2.2vw, 28px)] mb-1.5">{e.title}</div>
                      <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2 max-w-[50ch]">{e.description}</p>
                      <div className="flex gap-4 mt-2 md:hidden font-mono text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {e.time}{e.endTime ? `–${e.endTime}` : ''}</span>
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {e.location}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col gap-1.5 font-mono text-[11px] text-muted-foreground tracking-[.04em]">
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3 opacity-70" /> {e.time}{e.endTime ? `–${e.endTime}` : ''}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3 opacity-70" /> {e.location}</span>
                    </div>
                    <div className="hidden md:grid w-10 h-10 rounded-full bg-surface-2 place-items-center group-hover:bg-foreground group-hover:text-background group-hover:-rotate-45 transition-all justify-self-end">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Veja o <em className="italic">calendário.</em></h2>
          <p className="text-muted-foreground max-w-[46ch] mx-auto mb-8">Visualize todos os eventos no calendário interativo com filtros por categoria.</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/calendario" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]"><Calendar className="h-4 w-4" /> Calendário interativo</Link>
            <Link href="/contato" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Fale conosco</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
