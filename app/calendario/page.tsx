'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Download,
  Sparkles,
} from 'lucide-react'
import { getEventos, type CmsEvento } from '@/lib/cms'
import { cn } from '@/lib/utils'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CATEGORY_COLORS: Record<string, string> = {
  culto: 'bg-primary text-primary-foreground',
  estudo: 'bg-accent text-accent-foreground',
  batismo: 'bg-brand-blue text-white',
  encontro: 'bg-brand-blue text-white',
  escola: 'bg-muted-foreground text-white',
  evento: 'bg-primary text-primary-foreground',
}

const CATEGORY_DOT: Record<string, string> = {
  culto: 'bg-primary',
  estudo: 'bg-accent',
  batismo: 'bg-brand-blue',
  encontro: 'bg-brand-blue',
  escola: 'bg-muted-foreground',
  evento: 'bg-destructive',
}

type EventoLike = CmsEvento

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function formatDateLong(d: Date) {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function toICS(events: EventoLike[]) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
      d.getMinutes()
    )}00`
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PIBAC//Calendario//PT']
  for (const e of events) {
    const [y, m, d] = e.date.split('-').map(Number)
    const [h, mi] = e.time.split(':').map(Number)
    const start = new Date(y, (m || 1) - 1, d || 1, h || 0, mi || 0)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@pibac`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${e.title}`,
      `DESCRIPTION:${(e.description || '').replace(/\n/g, ' ')}`,
      `LOCATION:${e.location || ''}`,
      'END:VEVENT'
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export default function CalendarioPage() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [eventos, setEventos] = useState<EventoLike[]>([])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState<Date | null>(today)
  const [filter, setFilter] = useState<string>('todos')

  useEffect(() => {
    let cancelled = false
    getEventos().then((rows) => {
      if (!cancelled) setEventos(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false })
    if (cells.length >= 42) break
  }

  const filteredEventos = useMemo(
    () => (filter === 'todos' ? eventos : eventos.filter((e) => e.category === filter)),
    [eventos, filter]
  )

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventoLike[]>()
    for (const e of filteredEventos) {
      const key = e.date
      const arr = map.get(key) || []
      arr.push(e)
      map.set(key, arr)
    }
    return map
  }, [filteredEventos])

  const selectedEvents = selected
    ? filteredEventos
        .filter((e) => sameDay(parseLocalDate(e.date), selected))
        .sort((a, b) => a.time.localeCompare(b.time))
    : []

  const upcoming = useMemo(
    () =>
      [...filteredEventos]
        .filter((e) => parseLocalDate(e.date) >= today)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 5),
    [filteredEventos, today]
  )

  const prevMonth = () => setCursor(new Date(year, month - 1, 1))
  const nextMonth = () => setCursor(new Date(year, month + 1, 1))
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(today)
  }

  const categories = ['todos', ...Array.from(new Set(eventos.map((e) => e.category)))]

  const downloadICS = () => {
    const blob = new Blob([toICS(filteredEventos)], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pibac-calendario.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <section className="relative bg-brand-gradient text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-20 -right-20 h-96 w-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-4">
            <Sparkles className="h-4 w-4 text-accent" />
            Agenda da Igreja
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Calendário Interativo
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Navegue pelos meses, clique em uma data e veja tudo que acontece na PIBAC.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Calendário */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              {/* Controles */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-6 border-b border-border">
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={prevMonth}
                    className="h-10 w-10 rounded-md border border-border hover:bg-muted text-foreground flex items-center justify-center transition"
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="h-10 w-10 rounded-md border border-border hover:bg-muted text-foreground flex items-center justify-center transition"
                    aria-label="Próximo mês"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <h2 className="ml-2 text-lg md:text-2xl font-serif font-bold text-foreground capitalize">
                    {MONTH_NAMES[month]} {year}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToday}
                    className="px-3 py-2 text-sm rounded-md border border-border hover:border-accent hover:bg-accent/5 text-foreground transition"
                  >
                    Hoje
                  </button>
                  <button
                    onClick={downloadICS}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-2 px-4 md:px-6 py-3 border-b border-border bg-muted/40">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium capitalize transition',
                      filter === c
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'bg-card text-muted-foreground border border-border hover:border-accent hover:text-foreground'
                    )}
                  >
                    {c === 'todos' ? 'Todos' : c}
                  </button>
                ))}
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 border-b border-border">
                {WEEK_DAYS.map((d, i) => (
                  <div
                    key={d}
                    className={cn(
                      'text-center py-3 text-xs font-semibold uppercase tracking-wide',
                      i === 0 || i === 6 ? 'text-destructive/80' : 'text-muted-foreground'
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grade de dias */}
              <div className="grid grid-cols-7">
                {cells.map((cell, i) => {
                  const key = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`
                  const dayEvents = eventsByDate.get(key) || []
                  const isToday = sameDay(cell.date, today)
                  const isSelected = selected && sameDay(cell.date, selected)

                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(cell.date)}
                      className={cn(
                        'group relative min-h-[72px] md:min-h-[96px] p-2 border-r border-b border-border/60 text-left transition',
                        !cell.inMonth && 'opacity-40 bg-muted/30',
                        cell.inMonth && 'hover:bg-accent/5 cursor-pointer',
                        isSelected && 'bg-accent/10 ring-2 ring-accent z-10'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-medium',
                            isToday && 'bg-primary text-primary-foreground',
                            !isToday && isSelected && 'text-primary font-bold',
                            !isToday && !isSelected && 'text-foreground'
                          )}
                        >
                          {cell.date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5 hidden md:block">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className={cn(
                              'truncate text-[10px] font-medium px-1.5 py-0.5 rounded',
                              CATEGORY_COLORS[e.category] || 'bg-primary text-primary-foreground'
                            )}
                          >
                            {e.time} {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                      </div>
                      <div className="md:hidden flex gap-0.5 flex-wrap mt-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={cn('h-1.5 w-1.5 rounded-full', CATEGORY_DOT[e.category] || 'bg-primary')}
                          />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sidebar com detalhes */}
            <div className="space-y-4">
              <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <CalendarIcon className="h-5 w-5" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Data selecionada</p>
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground capitalize">
                  {selected ? formatDateLong(selected) : 'Selecione um dia'}
                </h3>

                <div className="mt-4 space-y-3">
                  {selectedEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center border-2 border-dashed border-border rounded-lg">
                      Nenhum evento marcado.
                    </p>
                  ) : (
                    selectedEvents.map((e) => (
                      <EventoCard key={e.id} e={e} />
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                  Próximos Eventos
                </p>
                <div className="space-y-3">
                  {upcoming.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nada agendado ainda.</p>
                  )}
                  {upcoming.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        const d = parseLocalDate(e.date)
                        setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
                        setSelected(d)
                      }}
                      className="w-full flex items-center gap-3 text-left hover:bg-muted p-2 -mx-2 rounded-md transition"
                    >
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded bg-accent/15 text-primary shrink-0">
                        <span className="text-sm font-bold leading-none">
                          {parseLocalDate(e.date).getDate()}
                        </span>
                        <span className="text-[10px] uppercase font-semibold leading-none mt-1">
                          {parseLocalDate(e.date)
                            .toLocaleDateString('pt-BR', { month: 'short' })
                            .replace('.', '')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.time} · {e.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gradient text-white rounded-2xl p-5 shadow-lg">
                <p className="text-sm font-semibold mb-1">Quer ver apenas os eventos?</p>
                <p className="text-xs opacity-90 mb-3">
                  Visualize a lista completa com filtros e busca.
                </p>
                <Link
                  href="/eventos"
                  className="inline-flex items-center gap-1 text-sm font-semibold bg-accent text-accent-foreground px-3 py-2 rounded-md hover:bg-accent/90 transition"
                >
                  Ver lista de eventos
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function EventoCard({ e }: { e: EventoLike }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30 hover:border-accent transition">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full mt-1.5 shrink-0',
            CATEGORY_DOT[e.category] || 'bg-primary'
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{e.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{e.description}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {e.time}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {e.location}
            </span>
            <span className="capitalize inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-primary font-medium">
              {e.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
