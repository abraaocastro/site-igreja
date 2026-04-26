'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Search, Filter, ArrowRight, SortAsc } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { getEventos, type CmsEvento } from '@/lib/cms'
import { cn } from '@/lib/utils'

type EventoLike = CmsEvento

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<EventoLike[]>([])
  const [query, setQuery] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [view, setView] = useState<'proximos' | 'passados'>('proximos')
  const [sort, setSort] = useState<'data' | 'titulo'>('data')

  useEffect(() => {
    let cancelled = false
    getEventos().then((rows) => {
      if (!cancelled) setEventos(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const categorias = useMemo(
    () => ['todas', ...Array.from(new Set(eventos.map((e) => e.category)))],
    [eventos]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = eventos.filter((e) => {
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      const matchC = categoria === 'todas' || e.category === categoria
      const inTime = view === 'proximos' ? parseLocalDate(e.date) >= today : parseLocalDate(e.date) < today
      return matchQ && matchC && inTime
    })
    if (sort === 'data') {
      list = list.sort(
        (a, b) => (view === 'passados' ? -1 : 1) * (a.date + a.time).localeCompare(b.date + b.time)
      )
    } else {
      list = list.sort((a, b) => a.title.localeCompare(b.title))
    }
    return list
  }, [eventos, query, categoria, view, sort, today])

  return (
    <div>
      <section className="relative bg-brand-gradient text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 bg-accent rounded-full blur-3xl -translate-x-1/4" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Eventos da Igreja
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Encontre cultos, encontros, conferências e tudo que acontece na nossa comunidade.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/calendario"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-md font-medium hover:bg-accent/90 transition"
            >
              <Calendar className="h-4 w-4" />
              Ver calendário
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Controles */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-5 mb-8 shadow-sm">
            <div className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar evento, local ou descrição..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="pl-9 pr-3 py-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm capitalize"
                >
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as 'data' | 'titulo')}
                  className="pl-9 pr-3 py-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="data">Ordenar por data</option>
                  <option value="titulo">Ordenar por título</option>
                </select>
              </div>
              <div className="flex gap-1 bg-muted p-1 rounded-md">
                <button
                  onClick={() => setView('proximos')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded transition',
                    view === 'proximos'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Próximos
                </button>
                <button
                  onClick={() => setView('passados')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded transition',
                    view === 'passados'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Passados
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {filtered.length} evento{filtered.length !== 1 && 's'} encontrado{filtered.length !== 1 && 's'}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum evento corresponde aos filtros.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <EventoCard key={e.id} evento={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle
            title="Cultos Regulares"
            subtitle="Junte-se a nós todas as semanas"
            className="text-primary-foreground"
          />
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {[
              { dia: 'Domingo', hora: '9h', tipo: 'EBD' },
              { dia: 'Domingo', hora: '19h', tipo: 'Culto de Celebração' },
              { dia: 'Quarta-feira', hora: '19h30', tipo: 'Estudo Bíblico' },
              { dia: 'Sábado', hora: '19h30', tipo: 'Jovens' },
            ].map((c) => (
              <div
                key={c.dia + c.hora}
                className="bg-white/10 backdrop-blur rounded-lg p-4 text-left border border-white/10"
              >
                <p className="font-bold text-lg">{c.dia}</p>
                <p className="opacity-90">
                  {c.hora} · {c.tipo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  culto: 'bg-primary',
  estudo: 'bg-accent text-accent-foreground',
  batismo: 'bg-brand-blue',
  encontro: 'bg-primary',
  escola: 'bg-muted-foreground',
  evento: 'bg-destructive',
}

function EventoCard({ evento }: { evento: EventoLike }) {
  const d = parseLocalDate(evento.date)
  return (
    <article className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover-lift">
      <div
        className="relative h-44 bg-cover bg-center"
        style={{ backgroundImage: evento.imageUrl ? `url(${evento.imageUrl})` : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <span
          className={cn(
            'absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white capitalize backdrop-blur',
            CATEGORY_COLORS[evento.category] || 'bg-primary'
          )}
        >
          {evento.category}
        </span>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-white text-primary shadow-md">
            <span className="text-lg font-bold leading-none">{d.getDate()}</span>
            <span className="text-[10px] uppercase font-semibold mt-0.5">
              {d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
            </span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors">
          {evento.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{evento.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" /> {evento.time}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {evento.location}
          </span>
        </div>
      </div>
    </article>
  )
}
