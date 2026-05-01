/**
 * calendar-utils — funções compartilhadas entre o calendário público
 * (`app/calendario/page.tsx`) e o calendar preview do admin.
 *
 * Extraído na Phase 10.2 pra evitar duplicação de lógica.
 */

export const MONTH_NAMES = [
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

export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const CATEGORY_COLORS: Record<string, string> = {
  culto: 'bg-primary text-primary-foreground',
  estudo: 'bg-accent text-accent-foreground',
  batismo: 'bg-brand-blue text-white',
  encontro: 'bg-brand-blue text-white',
  escola: 'bg-muted-foreground text-white',
  evento: 'bg-primary text-primary-foreground',
}

export const CATEGORY_DOT: Record<string, string> = {
  culto: 'bg-primary',
  estudo: 'bg-accent',
  batismo: 'bg-brand-blue',
  encontro: 'bg-brand-blue',
  escola: 'bg-muted-foreground',
  evento: 'bg-destructive',
}

/** Compara se duas datas caem no mesmo dia (ignora hora). */
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Converte ISO date (YYYY-MM-DD) em Date local (sem fuso). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Formata data por extenso em PT-BR. */
export function formatDateLong(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/** Gera as células do grid de um mês (inclui dias do mês anterior/posterior). */
export function buildMonthCells(
  year: number,
  month: number
): Array<{ date: Date; inMonth: boolean }> {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: Date; inMonth: boolean }[] = []

  // Dias do mês anterior pra preencher a primeira semana
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false })
  }
  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  // Dias do próximo mês pra completar a grade (até 42 = 6 semanas)
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    })
    if (cells.length >= 42) break
  }

  return cells
}

/** Converte Date em chave YYYY-MM-DD (mesma usada em CmsEvento.date). */
export function dateToKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Agrupa eventos por data (chave YYYY-MM-DD). */
export function groupEventsByDate<T extends { date: string }>(
  events: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const e of events) {
    const arr = map.get(e.date) || []
    arr.push(e)
    map.set(e.date, arr)
  }
  return map
}
