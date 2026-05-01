'use client'

/**
 * CalendarPreview — mini-calendário para o EventosEditor (admin).
 *
 * Mostra o mês atual (com navegação), dots coloridos por categoria nos dias
 * com eventos, e permite clicar num dia para filtrar a lista de eventos.
 *
 * Props:
 *  - events: CmsEvento[] — lista completa de eventos do banco
 *  - selectedDate: string | null — data selecionada (YYYY-MM-DD) ou null
 *  - onSelectDate: (date: string | null) => void — callback ao clicar num dia
 */

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { type CmsEvento } from '@/lib/cms'
import {
  MONTH_NAMES,
  WEEK_DAYS,
  CATEGORY_DOT,
  buildMonthCells,
  dateToKey,
  groupEventsByDate,
  sameDay,
  parseLocalDate,
} from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'

interface CalendarPreviewProps {
  events: CmsEvento[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

export function CalendarPreview({ events, selectedDate, onSelectDate }: CalendarPreviewProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const cells = useMemo(() => buildMonthCells(year, month), [year, month])
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])

  const selectedObj = selectedDate ? parseLocalDate(selectedDate) : null

  const prevMonth = () => setCursor(new Date(year, month - 1, 1))
  const nextMonth = () => setCursor(new Date(year, month + 1, 1))
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    onSelectDate(null)
  }

  const handleDayClick = (date: Date, inMonth: boolean) => {
    if (!inMonth) return
    const key = dateToKey(date)
    // Toggle: clicar no mesmo dia deseleciona
    onSelectDate(selectedDate === key ? null : key)
  }

  // Contagem de eventos no mês visível
  const eventsThisMonth = useMemo(() => {
    return events.filter((e) => {
      const d = parseLocalDate(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    }).length
  }, [events, year, month])

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h3>
          <span className="text-[11px] text-muted-foreground">
            ({eventsThisMonth} evento{eventsThisMonth !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="px-2 py-1 text-[11px] rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            Hoje
          </button>
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-muted transition"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-muted transition"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Filtro ativo */}
      {selectedDate && (
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-accent/10 border border-accent/20">
          <p className="text-xs text-foreground">
            Filtrando por:{' '}
            <strong>
              {parseLocalDate(selectedDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
              })}
            </strong>
          </p>
          <button
            onClick={() => onSelectDate(null)}
            className="text-[11px] text-primary hover:underline"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-0">
        {WEEK_DAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'text-center py-1 text-[10px] font-semibold uppercase tracking-wide',
              i === 0 || i === 6 ? 'text-destructive/70' : 'text-muted-foreground'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((cell, i) => {
          const key = dateToKey(cell.date)
          const dayEvents = eventsByDate.get(key) || []
          const isToday = sameDay(cell.date, today)
          const isSelected = selectedObj && sameDay(cell.date, selectedObj)

          return (
            <button
              key={i}
              onClick={() => handleDayClick(cell.date, cell.inMonth)}
              disabled={!cell.inMonth}
              className={cn(
                'relative flex flex-col items-center justify-center py-1.5 rounded transition',
                !cell.inMonth && 'opacity-30 cursor-default',
                cell.inMonth && 'hover:bg-muted cursor-pointer',
                isSelected && 'bg-primary/10 ring-1 ring-primary'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium',
                  isToday && 'bg-primary text-primary-foreground',
                  !isToday && isSelected && 'text-primary font-bold',
                  !isToday && !isSelected && 'text-foreground'
                )}
              >
                {cell.date.getDate()}
              </span>

              {/* Dots de categorias */}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <span
                      key={j}
                      className={cn(
                        'h-1 w-1 rounded-full',
                        CATEGORY_DOT[e.category] || 'bg-primary'
                      )}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legenda de categorias */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 border-t border-border">
        {Object.entries(CATEGORY_DOT).map(([cat, dotClass]) => (
          <div key={cat} className="flex items-center gap-1">
            <span className={cn('h-2 w-2 rounded-full', dotClass)} />
            <span className="text-[10px] text-muted-foreground capitalize">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
