/**
 * next-event — helpers para "próximo evento" e "eventos da semana".
 *
 * Combina 2 fontes:
 *  1. **Recorrentes** (cms_cultos_recorrentes): expandidos para datas reais
 *  2. **Especiais** (cms_eventos): usa date+time literalmente
 *
 * Atualizado: recorrentes agora vêm do CMS (com imagem!) em vez de hardcoded.
 */

import type { CmsEvento, CmsCultoRecorrente } from '@/lib/cms'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface UpcomingEvent {
  datetime: Date
  endDatetime: Date
  title: string
  time: string
  endTime: string
  weekday: string
  isSpecial: boolean
  imageUrl: string | null
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

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
 * Expande cultos recorrentes do CMS para datas reais.
 * Gera ocorrências para esta semana e a próxima (14 dias).
 */
function expandRecurring(cultosRecorrentes: CmsCultoRecorrente[], now: Date): UpcomingEvent[] {
  const results: UpcomingEvent[] = []
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  for (const culto of cultosRecorrentes) {
    const dayIndex = culto.diaSemana
    const [h, m] = culto.horario.split(':').map(Number)
    const [eh, em] = culto.horarioFim.split(':').map(Number)

    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      const target = new Date(today)
      const diff = dayIndex - today.getDay()
      target.setDate(today.getDate() + diff + weekOffset * 7)
      target.setHours(h, m, 0, 0)

      const endTarget = new Date(target)
      endTarget.setHours(eh, em, 0, 0)
      if (endTarget.getTime() <= target.getTime()) endTarget.setDate(endTarget.getDate() + 1)

      results.push({
        datetime: target,
        endDatetime: endTarget,
        title: culto.titulo,
        time: culto.horario,
        endTime: culto.horarioFim,
        weekday: WEEKDAY_LABELS[dayIndex] ?? '',
        isSpecial: false,
        imageUrl: culto.imageUrl,
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

    const [eh, em] = (e.endTime || '20:00').split(':').map(Number)
    const endDt = new Date(y, mo - 1, d, eh, em, 0, 0)
    if (endDt.getTime() <= dt.getTime()) endDt.setDate(endDt.getDate() + 1)

    return {
      datetime: dt,
      endDatetime: endDt,
      title: e.title,
      time: e.time,
      endTime: e.endTime || '20:00',
      weekday: WEEKDAY_LABELS[dt.getDay()] ?? '',
      isSpecial: true,
      imageUrl: e.imageUrl,
    }
  })
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Retorna o próximo evento (recorrente ou especial) a partir de `now`.
 * Um evento é considerado "futuro" se ainda não terminou (endDatetime > now).
 */
export function getNextEvent(
  eventos: CmsEvento[],
  cultosRecorrentes: CmsCultoRecorrente[],
  now: Date = new Date()
): UpcomingEvent | null {
  const all = [...expandRecurring(cultosRecorrentes, now), ...convertEspeciais(eventos)]
    .filter((e) => e.endDatetime.getTime() > now.getTime())
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())

  return all[0] ?? null
}

/**
 * Retorna os eventos pendentes da semana corrente (seg 00:00 → dom 23:59).
 */
export function getWeekEvents(
  eventos: CmsEvento[],
  cultosRecorrentes: CmsCultoRecorrente[],
  now: Date = new Date()
): UpcomingEvent[] {
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset, 0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const all = [...expandRecurring(cultosRecorrentes, now), ...convertEspeciais(eventos)]
    .filter((e) => {
      const t = e.datetime.getTime()
      const end = e.endDatetime.getTime()
      return end > now.getTime() && t >= monday.getTime() && t <= sunday.getTime()
    })
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())

  // Deduplicar: evento especial priorizado sobre recorrente no mesmo horário
  const seen = new Map<string, UpcomingEvent>()
  for (const e of all) {
    const key = `${e.datetime.getTime()}`
    const existing = seen.get(key)
    if (!existing || e.isSpecial) seen.set(key, e)
  }

  return Array.from(seen.values()).sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
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
