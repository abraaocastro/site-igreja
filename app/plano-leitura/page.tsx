'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Check, Trophy, RefreshCw, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { planoLeitura } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STORAGE = 'pibac-plano-progress'

export default function PlanoLeituraPage() {
  const [done, setDone] = useState<Record<number, boolean>>({})
  const [ready, setReady] = useState(false)
  const [focusDia, setFocusDia] = useState<number>(1)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      if (raw) setDone(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE, JSON.stringify(done))
    } catch {}
  }, [done, ready])

  const total = planoLeitura.length
  const completed = Object.values(done).filter(Boolean).length
  const progress = Math.round((completed / total) * 100)

  const toggle = (dia: number) => {
    setDone((d) => ({ ...d, [dia]: !d[dia] }))
  }

  const reset = () => {
    if (confirm('Reiniciar todo o progresso?')) {
      setDone({})
      toast.success('Progresso reiniciado.')
    }
  }

  const share = async () => {
    const text = `Estou lendo a Bíblia com a PIBAC! Já completei ${completed} de ${total} dias (${progress}%). Junte-se a nós!`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Plano de Leitura PIBAC', text })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Texto copiado! Compartilhe com seus amigos.')
    }
  }

  const focus = planoLeitura.find((p) => p.dia === focusDia)

  const semanas = useMemo(() => {
    const groups: typeof planoLeitura[] = []
    for (let i = 0; i < planoLeitura.length; i += 7) {
      groups.push(planoLeitura.slice(i, i + 7))
    }
    return groups
  }, [])

  return (
    <div>
      <section className="relative bg-brand-gradient text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-4">
            <BookOpen className="h-4 w-4 text-accent" />
            30 dias na Palavra
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Plano de Leitura Bíblica
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Leia a Bíblia com a comunidade PIBAC. Um capítulo por dia, uma vida transformada.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[340px_1fr] gap-8">
          {/* Progresso */}
          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Seu progresso</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-serif font-bold text-foreground">{progress}%</p>
                <p className="text-sm text-muted-foreground pb-2">{completed}/{total} dias</p>
              </div>
              <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-brand-gradient-cyan transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={share}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border hover:bg-muted text-sm font-medium transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reiniciar
                </button>
              </div>

              {progress === 100 && (
                <div className="mt-6 p-4 rounded-lg bg-accent/15 text-foreground border border-accent/40 flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-primary" />
                  <p className="text-sm font-medium">Você completou o plano! Parabéns! 🎉</p>
                </div>
              )}
            </div>

            {focus && (
              <div className="bg-brand-gradient text-white rounded-2xl p-6 shadow-lg">
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Dia {focus.dia}</p>
                <h3 className="text-2xl font-serif font-bold">{focus.tema}</h3>
                <p className="mt-2 opacity-90">
                  {focus.livro} {focus.capitulos}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setFocusDia(Math.max(1, focusDia - 1))}
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    disabled={focusDia === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggle(focus.dia)}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition',
                      done[focus.dia]
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-white text-primary hover:bg-white/90'
                    )}
                  >
                    <Check className="h-4 w-4" />
                    {done[focus.dia] ? 'Concluído' : 'Marcar como lido'}
                  </button>
                  <button
                    onClick={() => setFocusDia(Math.min(total, focusDia + 1))}
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    disabled={focusDia === total}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Lista */}
          <div>
            <SectionTitle
              title="30 dias de jornada"
              subtitle="Clique em um dia para focar ou marque como concluído"
              centered={false}
            />
            <div className="space-y-6">
              {semanas.map((semana, i) => (
                <div key={i}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Semana {i + 1}
                  </h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {semana.map((item) => {
                      const isDone = done[item.dia]
                      const isFocus = item.dia === focusDia
                      return (
                        <button
                          key={item.dia}
                          onClick={() => setFocusDia(item.dia)}
                          className={cn(
                            'group text-left p-4 rounded-xl border-2 transition-all',
                            isFocus
                              ? 'border-accent bg-accent/10'
                              : isDone
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-border bg-card hover:border-primary/40'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-primary">DIA {item.dia}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggle(item.dia)
                              }}
                              className={cn(
                                'h-6 w-6 rounded-full flex items-center justify-center border-2 transition',
                                isDone
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/30 hover:border-primary'
                              )}
                              aria-label={isDone ? 'Desmarcar' : 'Marcar como lido'}
                            >
                              {isDone && <Check className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="font-semibold text-sm text-foreground line-clamp-2">{item.tema}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.livro} {item.capitulos}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif italic mb-3">
            &ldquo;Lâmpada para os meus pés é tua palavra e luz para o meu caminho.&rdquo;
          </blockquote>
          <cite className="opacity-90">Salmos 119:105</cite>
        </div>
      </section>
    </div>
  )
}
