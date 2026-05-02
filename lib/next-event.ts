/**
 * next-event — helpers para "próximo evento" e "eventos da semana".
 *
 * Combina 2 fontes:
 *  1. **Recorrentes** (horariosCultos de lib/data.ts): expande para datas
 *     reais da semana corrente e da próxima
 *  2. **Especiais** (cms_eventos): usa date+time literalmente
 *
 * Phase 10.6 — `getNextEvent()` para o contador inteligente
 * Phase 10.8 — `getWeekEvents()` para o marquee da semana atual
 */

import { horariosCultos } from '@/lib/data'
import type { CmsEvento } from '@/lib/cms'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface UpcomingEvent {
  /** Data/hora real do evento */
  datetime: Date
  /** Título do evento (ex: "Culto de Celebração" ou "Batismo ao ar livre") */
  title: string
  /** Horário formatado (ex: "19:00") */
  time: string
  /** Dia da semana (ex: "Domingo") */
  weekday: string
  /** true se veio de cms_eventos, false se é recorrente */
  isSpecial: boolean
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const WEEKDAY_MAP: Record<string, number> = {
  domingo: 0,
  'segunda-feira': 1,
  segunda: 1,
  'terça-feira': 2,
  terça: 2,
  'quarta-feira': 3,
  quarta: 3,
  'quinta-feira': 4,
  quinta: 4,
  'sexta-feira': 5,
  sexta: 5,
  sábado: 6,
  sabado: 6,
}

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Expande os horários recorrentes (horariosCultos) para datas reais.
 * Gera ocorrências para esta semana e a próxima (14 dias).
 */
function expandRecurring(now: Date): UpcomingEvent[] {
  const results: UpcomingEvent[] = []
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  for (const culto of horariosCultos) {
    const dayIndex = WEEKDAY_MAP[culto.dia.toLowerCase()]
    if (dayIndex === undefined) continue

    const [h, m] = culto.horario.split(':').map(Number)

    // Gerar pra esta semana e a próxima (2 ocorrências)
    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      const target = new Date(today)
      const diff = dayIndex - today.getDay()
      target.setDate(today.getDate() + diff + weekOffset * 7)
      target.setHours(h, m, 0, 0)

      results.push({
        datetime: target,
        title: culto.tipo,
        time: culto.horario,
        weekday: WEEKDAY_LABELS[dayIndex] ?? culto.dia,
        isSpecial: false,
      })
    }
  }

  return results
}

/**
 * Converte cms_eventos em UpcomingEvent[].
 */
function convertEspeciais(eventos: CmsEvento[]): UpcomingEvent[] {
  return eventos.map((e) => {
    const [y, mo, d] = e.date.split('-').map(Number)
    const [h, m] = (e.time || '00:00').split(':').map(Number)
    const dt = new Date(y, mo - 1, d, h, m, 0, 0)
    return {
      datetime: dt,
      title: e.title,
      time: e.time,
      weekday: WEEKDAY_LABELS[dt.getDay()] ?? '',
      isSpecial: true,
    }
  })
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Retorna o próximo evento (recorrente ou especial) a partir de `now`.
 * Usado pelo contador "Próximo culto" na home.
 */
export function getNextEvent(
  eventos: CmsEvento[],
  now: Date = new Date()
): UpcomingEvent | null {
  const all = [...expandRecurring(now), ...convertEspeciais(eventos)]
    .filter((e) => e.datetime.getTime() > now.getTime())
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())

  return all[0] ?? null
}

/**
 * Retorna os eventos pendentes da semana corrente (seg 00:00 → dom 23:59),
 * ordenados por datetime ascendente. Usado pelo marquee.
 *
 * Se agora é domingo 22h e não sobrou nada, retorna lista vazia.
 */
export function getWeekEvents(
  eventos: CmsEvento[],
  now: Date = new Date()
): UpcomingEvent[] {
  // Início da semana (segunda 00:00) e fim (domingo 23:59)
  const day = now.getDay() // 0=dom, 1=seg...
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset, 0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const all = [...expandRecurring(now), ...convertEspeciais(eventos)]
    .filter((e) => {
      const t = e.datetime.getTime()
      return t > now.getTime() && t >= monday.getTime() && t <= sunday.getTime()
    })
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())

  // Deduplicar: se um evento especial cai no mesmo horário de um recorrente,
  // priorizar o especial (tem título mais descritivo)
  const seen = new Map<string, UpcomingEvent>()
  for (const e of all) {
    const key = `${e.datetime.getTime()}`
    const existing = seen.get(key)
    if (!existing || e.isSpecial) {
      seen.set(key, e)
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => a.datetime.getTime() - b.datetime.getTime()
  )
}

/**
 * Calcula o countdown (dias, horas, min, seg) entre `now` e `target`.
 */
export function countdown(now: Date, target: Date): { d: number; h: number; m: number; s: number } {
  const diff = Math.max(0, target.getTime() - now.getTime())
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}
