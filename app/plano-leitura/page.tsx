'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Check, Trophy, RefreshCw, ArrowUpRight } from 'lucide-react'
import { getPlanoLeitura, type CmsPlanoLeituraDay } from '@/lib/cms'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STORAGE = 'pibac-plano-progress'

export default function PlanoLeituraPage() {
  const [plano, setPlano] = useState<CmsPlanoLeituraDay[]>([])
  const [done, setDone] = useState<Record<number, boolean>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => { let c = false; getPlanoLeitura().then(r => { if (!c) setPlano(r) }); return () => { c = true } }, [])
  useEffect(() => { try { const r = localStorage.getItem(STORAGE); if (r) setDone(JSON.parse(r)) } catch {} setReady(true) }, [])
  useEffect(() => { if (!ready) return; try { localStorage.setItem(STORAGE, JSON.stringify(done)) } catch {} }, [done, ready])

  const total = plano.length
  const completed = Object.values(done).filter(Boolean).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const toggle = (dia: number) => setDone(d => ({ ...d, [dia]: !d[dia] }))
  const reset = () => { setDone({}); toast.success('Progresso reiniciado.') }

  // Agrupar em semanas de 7
  const semanas = useMemo(() => {
    const g: typeof plano[] = []
    for (let i = 0; i < plano.length; i += 7) g.push(plano.slice(i, i + 7))
    return g
  }, [plano])

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center">
            <div>
              <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Devocional</div>
              <h1 className="display mb-5" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
                Plano de<br />Leitura <em className="text-brand-gradient">Bíblica.</em>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-[46ch]">
                30 dias para mergulhar na Palavra junto da nossa comunidade. Marque os dias conforme avança.
              </p>
            </div>

            {/* Progress card */}
            <div className="relative rounded-[22px] bg-brand-gradient text-white p-7 overflow-hidden">
              <div className="bg-grain absolute inset-0 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="eyebrow text-accent">Seu progresso</div>
                  <button onClick={reset} className="text-[11px] font-mono text-white/60 hover:text-white transition inline-flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3" /> Reiniciar
                  </button>
                </div>
                <div className="font-serif text-[64px] leading-none tracking-tight mb-2">{progress}<span className="text-[28px] text-accent">%</span></div>
                <div className="text-sm text-white/70 mb-5">{completed} de {total} dias concluídos</div>
                <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                {progress === 100 && (
                  <div className="mt-5 flex items-center gap-2 text-accent font-medium">
                    <Trophy className="h-5 w-5" /> Parabéns! Plano concluído!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Semanas */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10 space-y-10">
          {semanas.map((sem, si) => (
            <div key={si}>
              <div className="eyebrow mb-4">Semana {si + 1}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
                {sem.map(d => {
                  const checked = done[d.dia]
                  return (
                    <button key={d.dia} onClick={() => toggle(d.dia)}
                      className={cn(
                        'card-soft rounded-[16px] p-4 text-left transition-all hover:!transform-none cursor-pointer border',
                        checked ? 'bg-accent/10 border-accent/30' : 'border-border'
                      )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-muted-foreground tracking-[.14em]">Dia {d.dia}</span>
                        <span className={cn('w-5 h-5 rounded-full grid place-items-center transition-colors text-xs',
                          checked ? 'bg-accent text-accent-foreground' : 'bg-surface-2')}>
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                      </div>
                      <div className="font-serif text-[15px] tracking-tight leading-tight mb-0.5">{d.livro} {d.capitulos}</div>
                      <div className="text-[11px] text-muted-foreground">{d.tema}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Continue <em className="italic">crescendo.</em></h2>
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            <Link href="/eventos" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Próximos eventos <ArrowUpRight className="h-4 w-4" /></Link>
            <Link href="/ministerios" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Ministérios</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
