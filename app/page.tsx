'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar, Clock, MapPin, ArrowUpRight, ArrowRight,
  Play, PlayCircle,
} from 'lucide-react'
import {
  getMinisterios,
  getEventos,
  getTextos,
  DEFAULT_TEXTOS,
  type CmsMinisterio,
  type CmsEvento,
  type CmsTextos,
} from '@/lib/cms'
import { getChurch, formatAddressOneLine, getMapsEmbedUrl } from '@/lib/site-data'
import { getNextEvent, getWeekEvents, countdown, type UpcomingEvent } from '@/lib/next-event'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Countdown hook ──
function useNextEventCountdown(eventos: CmsEvento[]) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const i = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(i)
  }, [])
  return useMemo(() => {
    if (!now) return null
    const nextEvt = getNextEvent(eventos, now)
    if (!nextEvt) return null
    const started = now.getTime() >= nextEvt.datetime.getTime()
    const ended = now.getTime() >= nextEvt.endDatetime.getTime()
    if (ended) return { d: 0, h: 0, m: 0, s: 0, event: nextEvt, isImminent: false, isLive: false }
    if (started) {
      const c = countdown(now, nextEvt.endDatetime)
      return { ...c, event: nextEvt, isImminent: true, isLive: true }
    }
    const c = countdown(now, nextEvt.datetime)
    const isImminent = nextEvt.datetime.getTime() - now.getTime() < 24 * 60 * 60 * 1000
    return { ...c, event: nextEvt, isImminent, isLive: false }
  }, [now, eventos])
}

export default function Home() {
  const church = getChurch()
  const [ministerios, setMinisterios] = useState<CmsMinisterio[]>([])
  const [eventos, setEventos] = useState<CmsEvento[]>([])
  const [textos, setTextos] = useState<CmsTextos>(DEFAULT_TEXTOS)

  useEffect(() => {
    Promise.all([getMinisterios(), getEventos(), getTextos()]).then(([m, e, t]) => {
      setMinisterios(m); setEventos(e); setTextos(t)
    })
  }, [])

  const next = useNextEventCountdown(eventos)
  const weekEvents = useMemo(() => getWeekEvents(eventos), [eventos])

  // Imagem do próximo evento (para o card hero)
  const nextEventImage = useMemo(() => {
    if (!next?.event) return null
    // Procurar evento especial do CMS que tem imagem
    const match = eventos.find(e => e.title === next.event!.title && e.imageUrl)
    return match?.imageUrl ?? null
  }, [next, eventos])
  const proximosEventos = [...eventos]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
    .slice(0, 3)
  const ministeriosDestaque = ministerios.slice(0, 9)

  const [filter, setFilter] = useState('todos')
  const cats = ['todos', 'adoracao', 'ensino', 'familia', 'missoes']
  const catLabels: Record<string, string> = { todos: 'Todos', adoracao: 'Adoração', ensino: 'Ensino', familia: 'Família', missoes: 'Missões' }
  const ministeriosFiltrados = filter === 'todos'
    ? ministeriosDestaque
    : ministeriosDestaque.filter((_, i) => (['adoracao','ensino','familia','missoes','adoracao','ensino','familia','missoes','adoracao'][i]) === filter)

  // Botão assistir
  const assistirUrl = textos.botaoAssistirUrl || '/eventos'
  const assistirLabel = textos.botaoAssistirRotulo || 'Assistir online'
  const assistirAoVivo = textos.botaoAssistirAoVivo === 'true'
  const assistirExternal = assistirUrl.startsWith('http')

  return (
    <div className="flex flex-col">

      {/* ════════ HERO ════════ */}
      <section className="pt-4 md:pt-9 pb-0">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">

          {/* Mobile: stack vertical. Desktop: 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-9 items-stretch">

            {/* LEFT — editorial copy */}
            <div className="flex flex-col py-2">
              {/* Meta */}
              <div className="eyebrow flex items-center gap-3 sm:gap-5 flex-wrap mb-5 lg:mb-9">
                <span className="inline-flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14"/></svg>
                  PIB Capim Grosso
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>Desde 1978</span>
              </div>

              {/* Title — smaller on mobile */}
              <h1 className="display display-tight text-[clamp(32px,7.5vw,132px)]">
                Um lugar<br />
                <span className="relative inline-block">
                  para voltar
                  <span className="absolute left-0 right-0 bottom-0.5 lg:bottom-1 h-2 lg:h-3.5 bg-accent/35 -z-10 rounded-sm" />
                </span><br />
                <span className="text-brand-gradient italic">pra casa.</span>
              </h1>

              {/* Lede — hidden on small mobile to save space */}
              <p className="hidden sm:block text-muted-foreground leading-relaxed max-w-[36ch] mt-8 lg:mt-14 text-[clamp(15px,1.4vw,19px)]">
                A Primeira Igreja Batista de Capim Grosso é onde fé, comunhão e
                crescimento espiritual se encontram — e onde toda história tem espaço.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-2.5 mt-6 lg:mt-9">
                <Link href="/quem-somos" className="btn btn-primary h-10 lg:h-[46px] px-4 lg:px-5 rounded-full text-sm lg:text-[15px]">
                  Conheça-nos <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/visao" className="btn btn-ghost h-10 lg:h-[46px] px-4 lg:px-5 rounded-full text-sm lg:text-[15px]">
                  Nossa visão
                </Link>
              </div>

              {/* Spacer — only on desktop */}
              <div className="hidden lg:block flex-1 min-h-8" />

              {/* Signals — hidden on mobile, shown sm+ */}
              <div className="hidden sm:grid mt-8 lg:mt-14 border-t border-border pt-5 grid-cols-3 gap-0">
                {[
                  { num: '48', sup: 'anos', label: 'de história em Capim Grosso' },
                  { num: String(ministerios.length || 6), sup: 'min.', label: 'ministérios toda semana' },
                  { num: '2x', sup: 'dom.', label: 'cultos · 9h e 19h' },
                ].map((s, i) => (
                  <div key={i} className={cn('px-2 lg:px-4', i === 0 && 'pl-0', i < 2 && 'border-r border-border')}>
                    <div className="font-serif text-xl lg:text-[32px] leading-none tracking-tight">
                      {s.num}<sup className="text-[9px] lg:text-xs align-top ml-0.5 text-muted-foreground font-mono font-normal">{s.sup}</sup>
                    </div>
                    <div className="text-[9px] lg:text-[11px] text-muted-foreground leading-snug mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — countdown feature card */}
            <div className="relative rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] overflow-hidden isolate bg-brand-gradient text-white min-h-[340px] sm:min-h-[380px] lg:min-h-[560px]">
              {/* Background image from next event */}
              {nextEventImage && (
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${nextEventImage})` }} />
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to bottom, rgba(2,11,33,.25) 0%, rgba(2,11,33,.55) 30%, rgba(2,11,33,.88) 55%, rgba(2,11,33,.97) 75%)',
                  }} />
                </div>
              )}
              {/* Glow effects */}
              <div className="absolute inset-0 z-0 pointer-events-none" style={{
                background: 'radial-gradient(circle at 80% 10%, rgba(0,194,255,.25), transparent 50%), radial-gradient(circle at 20% 90%, rgba(111,163,255,.18), transparent 50%)',
              }} />
              <div className="bg-grain absolute inset-0 z-0 pointer-events-none" />

              <div className="relative z-10 p-5 sm:p-6 lg:p-7 h-full flex flex-col">
                {/* Top chrome */}
                <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-[.16em] text-white/70 mb-auto">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {next ? (next.isLive ? 'Ao vivo' : 'Próximo') : 'Programação'}
                  </span>
                </div>

                {/* Content — empurrado pra baixo */}
                <div className="mt-auto pt-6">
                  {next ? (
                    <>
                      <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[.18em] text-white/90 mb-3 sm:mb-4" style={{ textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>
                        <span className="pulse-dot" style={{ background: 'var(--accent)', animationName: 'pulseCyan' }} />
                        {next.isLive ? 'Acontecendo agora' : 'Próximo culto'}
                      </div>
                      <div className="font-serif leading-[0.95] tracking-tight mb-1.5 text-[clamp(28px,6vw,56px)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,.5)' }}>
                        {next.event?.title || 'Culto da Família'}.
                      </div>
                      <div className="font-mono text-[10px] sm:text-xs text-white/70 tracking-[.08em] uppercase mb-5 sm:mb-6" style={{ textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>
                        {next.event
                          ? `${next.event.weekday} · ${next.event.time} · Templo Sede`
                          : 'Domingo · 19:00 · Templo Sede'}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3.5 mb-5 sm:mb-6">
                        {(['d','h','m','s'] as const).map((k, i) => {
                          const labels = ['Dias', 'Horas', 'Min', 'Seg']
                          const val = [next.d, next.h, next.m, next.s][i]
                          return (
                            <div key={k} className="text-center py-2.5 sm:py-3 lg:py-4 border-t border-b border-white/[.18] backdrop-blur-sm bg-white/[.04] rounded-lg">
                              <div className="font-serif font-normal leading-[0.9] tracking-tight tabular-nums text-[clamp(28px,6vw,64px)]" style={{ textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>
                                {String(val).padStart(2, '0')}
                              </div>
                              <div className="font-mono text-[7px] sm:text-[8px] lg:text-[9px] uppercase tracking-[.2em] text-white/60 mt-1.5 sm:mt-2">{labels[i]}</div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    /* Estado vazio — sem próximo evento */
                    <div className="text-center py-8">
                      <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[.18em] text-white/60 mb-4">Nenhum evento programado</div>
                      <div className="font-serif leading-[0.95] tracking-tight mb-4 text-[clamp(24px,5vw,44px)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,.5)' }}>
                        Acompanhe nossa<br />programação.
                      </div>
                      <p className="text-sm text-white/60 max-w-[36ch] mx-auto mb-6">
                        Novos eventos e cultos são adicionados regularmente. Fique de olho no calendário.
                      </p>
                    </div>
                  )}

                  {/* CTAs — sempre visíveis */}
                  <div className="flex gap-2 sm:gap-2.5 mt-5 sm:mt-6">
                    {assistirExternal ? (
                      <a href={assistirUrl} target="_blank" rel="noreferrer"
                        className={cn('flex-1 h-10 sm:h-11 rounded-full inline-flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-medium transition-all',
                          assistirAoVivo ? 'bg-destructive text-white animate-pulse' : 'bg-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5')}>
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" /> {assistirLabel}
                      </a>
                    ) : (
                      <Link href={assistirUrl}
                        className={cn('flex-1 h-10 sm:h-11 rounded-full inline-flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-medium transition-all',
                          assistirAoVivo ? 'bg-destructive text-white animate-pulse' : 'bg-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5')}>
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" /> {assistirLabel}
                      </Link>
                    )}
                    <Link href="/calendario"
                      className="flex-1 h-10 sm:h-11 rounded-full inline-flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-medium bg-white/[.08] text-white border border-white/[.18] hover:bg-white/[.14] backdrop-blur-sm transition">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Agenda
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MARQUEE STRIP */}
          <div className="schedule-strip mt-5 sm:mt-7" aria-label="Programação semanal">
            {weekEvents.length > 0 ? (
              <div className="marquee-track">
                {[...weekEvents, ...weekEvents].map((e, i) => (
                  <span key={i} className="marquee-item">
                    <span className="day">{e.weekday.slice(0, 3).toUpperCase()}</span>
                    <span className="time">{e.time}</span>
                    <span className="name">{e.title}</span>
                    <span className="marquee-dot" />
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center w-full text-xs sm:text-sm text-white/60 py-2">
                Sem mais eventos esta semana —{' '}
                <Link href="/eventos" className="text-accent hover:underline">veja a programação</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════ WELCOME ════════ */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20">
            <div className="lg:sticky lg:top-[100px] lg:self-start">
              <div className="eyebrow mb-6 inline-flex items-center gap-2.5">
                <span className="w-7 h-px bg-current opacity-50" /> Boas-vindas
              </div>
              <h2 className="display mb-7" style={{ fontSize: 'clamp(48px, 6vw, 84px)' }}>
                Aqui, toda<br />história tem<br /><em className="text-brand-gradient">espaço.</em>
              </h2>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/quem-somos" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">
                  Conheça nossa fé <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/visao" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Nossa visão</Link>
              </div>
            </div>
            <div>
              <p className="text-[19px] leading-[1.6] mb-6 max-w-[56ch]">
                Somos uma comunidade que acredita que ninguém precisa ter sua vida resolvida
                para entrar pela porta. Aqui você encontra paz para descansar, pessoas para
                caminhar junto e a Palavra para te guiar.
              </p>
              <p className="text-base leading-[1.6] text-muted-foreground mb-12 max-w-[56ch]">
                Nossa missão é proclamar o Evangelho de Jesus Cristo, fazer discípulos e
                transformar vidas pelo amor e pela graça de Deus — em Capim Grosso e além.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { n: '/01', t: 'Amor', d: 'Compartilhando o amor de Cristo todos os dias.' },
                  { n: '/02', t: 'Comunhão', d: 'Crescendo juntos como família da fé.' },
                  { n: '/03', t: 'Palavra', d: 'Fundamentados na Bíblia, vivendo a verdade.' },
                  { n: '/04', t: 'Missões', d: 'Alcançando vidas para Cristo onde estivermos.' },
                ].map(p => (
                  <div key={p.n} className="p-5 rounded-[18px] bg-surface border border-border hover:-translate-y-1 hover:border-foreground transition-all duration-200">
                    <div className="font-mono text-[11px] text-muted-foreground tracking-[.14em] mb-3">{p.n}</div>
                    <div className="font-serif text-[22px] leading-none tracking-tight mb-1.5">{p.t}</div>
                    <div className="text-[13px] text-muted-foreground leading-snug">{p.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PASTOR ════════ */}
      <section className="py-24 lg:py-32 bg-surface-2 border-y border-border relative overflow-hidden">
        <div className="pointer-events-none absolute right-[-2vw] bottom-[-3vw] font-serif italic leading-none tracking-[-0.06em] text-surface-3 select-none" style={{ fontSize: 'clamp(180px, 28vw, 460px)' }}>
          Pastor
        </div>
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-[72px] items-center">
            {/* Portrait */}
            <div className="relative aspect-[4/5] rounded-[22px] lg:rounded-[28px] overflow-hidden bg-brand-gradient" style={{ boxShadow: '0 36px 80px -36px rgba(11,16,32,.35)' }}>
              <Image src="/pastor-silas.webp" alt="Pr. Silas Barreto" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
              <span className="absolute top-[18px] left-[18px] inline-flex items-center gap-2 h-[30px] px-3 rounded-full bg-background/95 backdrop-blur border border-border text-[11px] font-medium">
                <span className="pulse-dot" /> Pastor presidente
              </span>
              <div className="absolute left-[18px] right-[18px] bottom-[18px] text-white">
                <div className="font-mono text-[10px] opacity-80 tracking-[.14em] uppercase mb-1.5">Liderando desde 2014</div>
                <div className="font-serif text-[22px] lg:text-[28px] leading-none tracking-tight">Pr. Silas Barreto</div>
              </div>
            </div>

            {/* Copy */}
            <div>
              <div className="eyebrow mb-4">— Liderança</div>
              <h2 className="display mb-6" style={{ fontSize: 'clamp(48px, 6vw, 84px)' }}>
                Liderando<br />com fé,<br />servindo<br />com <em>amor.</em>
              </h2>
              <p className="text-[17px] leading-[1.65] text-muted-foreground mb-4 max-w-[52ch]">
                Sob a liderança do Pastor Silas, a PIBAC tem vivido um tempo de crescimento
                espiritual, fortalecimento das famílias e avanço missionário em toda a região.
              </p>
              <p className="text-[17px] leading-[1.65] text-muted-foreground mb-0 max-w-[52ch]">
                Ele dedica sua vida à pregação fiel da Palavra, ao cuidado pastoral e à
                formação de novos discípulos para a glória de Deus.
              </p>

              <blockquote className="mt-10 pl-7 py-1 border-l-2 border-accent bg-accent/[.05] rounded-r-[14px] pr-7 relative max-w-[48ch]">
                <span className="absolute top-[-8px] left-4 font-serif text-[60px] text-accent/50 leading-none">&ldquo;</span>
                <p className="font-serif text-[22px] leading-[1.35] tracking-tight italic pt-4 pb-3">
                  A igreja é o lugar onde a graça de Deus encontra vidas reais — e nenhuma
                  delas chega tarde demais.
                </p>
              </blockquote>

              <div className="flex flex-wrap gap-2.5 mt-8">
                <Link href="/pastor" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">
                  Conhecer o pastor <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ MINISTÉRIOS ════════ */}
      <section className="py-28 lg:py-32">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <div className="eyebrow mb-3.5">— Nossos ministérios</div>
              <h2 className="display max-w-[16ch]" style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginTop: 14 }}>
                Encontre o seu<br />lugar para servir.
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-surface-2 rounded-full">
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={cn('h-[38px] px-4 rounded-full text-[13px] font-medium transition-all border-0 cursor-pointer',
                    filter === c ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                  {catLabels[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {ministeriosFiltrados.map((m, i) => (
              <Link key={m.id} href={`/ministerios#${m.id}`}
                className="group card-soft rounded-[22px] overflow-hidden cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-3">
                  {m.imageUrl && (
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${m.imageUrl})` }} />
                  )}
                  {!m.imageUrl && <div className="absolute inset-0 ph-stripes" />}
                  <span className="absolute top-3.5 left-4 font-mono text-[11px] tracking-[.14em] text-foreground bg-background/[.92] px-2.5 py-1 rounded-full border border-border">
                    /{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="p-[22px] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-2xl leading-[1.1] tracking-tight font-medium">{m.name}</h3>
                    <span className="w-9 h-9 rounded-full bg-surface-2 grid place-items-center shrink-0 group-hover:bg-foreground group-hover:text-background group-hover:-rotate-45 transition-all duration-200">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-snug line-clamp-2">{m.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-14">
            <Link href="/ministerios" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">
              Ver todos os ministérios <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ EVENTOS (dark section) ════════ */}
      <section className="py-28 lg:py-32 relative overflow-hidden bg-brand-navy text-white">
        <div className="absolute top-[-10vh] right-[-10vw] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(0,194,255,.18), transparent 60%)',
        }} />
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 md:px-10">
          <div className="mb-14 max-w-[720px]">
            <div className="eyebrow text-accent mb-4">— Próximos eventos</div>
            <h2 className="display mb-5" style={{ fontSize: 'clamp(44px, 6vw, 84px)' }}>
              Participe e<br />cresça conosco.
            </h2>
            <p className="text-[17px] text-white/65 leading-relaxed max-w-[50ch]">
              Encontros, celebrações e formações abertas à comunidade de Capim Grosso e região.
            </p>
          </div>

          {proximosEventos.length === 0 ? (
            <div className="text-center py-10 text-white/50">Nenhum evento agendado no momento.</div>
          ) : (
            <div className="border-t border-white/[.12]">
              {proximosEventos.map((e) => {
                const d = parseISO(e.date)
                return (
                  <Link key={e.id} href={`/eventos#${e.id}`}
                    className="group grid grid-cols-1 md:grid-cols-[140px_1fr_220px_60px] gap-4 md:gap-6 py-7 border-b border-white/[.12] items-start md:items-center transition-all hover:pl-4 cursor-pointer">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif tabular-nums leading-[0.85] tracking-tight" style={{ fontSize: 'clamp(48px, 6vw, 76px)' }}>
                        {format(d, 'dd')}
                      </span>
                      <span className="font-mono text-[11px] tracking-[.18em] text-accent uppercase">
                        {format(d, 'MMM', { locale: ptBR }).replace('.', '')}<br />{format(d, 'yyyy')}
                      </span>
                    </div>
                    <div>
                      <div className="font-serif leading-[1.05] tracking-tight mb-2" style={{ fontSize: 'clamp(22px, 2.4vw, 32px)' }}>{e.title}</div>
                      <p className="text-[14px] text-white/60 leading-snug line-clamp-2 max-w-[56ch]">{e.description}</p>
                    </div>
                    <div className="hidden md:flex flex-col gap-2 font-mono text-xs text-white/65 tracking-[.04em]">
                      <span className="inline-flex items-center gap-2"><Clock className="h-3 w-3 opacity-70" /> {e.time}</span>
                      <span className="inline-flex items-center gap-2"><MapPin className="h-3 w-3 opacity-70" /> {e.location}</span>
                    </div>
                    <div className="hidden md:grid w-11 h-11 rounded-full bg-white/[.08] place-items-center text-white group-hover:bg-accent group-hover:text-accent-foreground group-hover:-rotate-45 transition-all justify-self-end">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-16">
            <Link href="/eventos" className="btn-accent h-[46px] px-5 rounded-full text-[15px]">
              Ver todos os eventos <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/calendario"
              className="h-[46px] px-5 rounded-full text-[15px] inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white hover:text-foreground transition font-medium">
              <Calendar className="h-4 w-4" /> Calendário interativo
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ DUO (plano + contribua) ════════ */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-[18px] md:gap-[22px]">
          <Link href="/plano-leitura"
            className="group relative overflow-hidden rounded-[22px] md:rounded-[28px] p-9 md:p-10 min-h-[280px] md:min-h-[320px] flex flex-col justify-between bg-brand-gradient text-white isolate hover:-translate-y-1 transition-transform duration-200">
            <div className="absolute -top-[120px] -right-[120px] w-[320px] h-[320px] rounded-full bg-accent/25 blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <div className="eyebrow text-accent mb-4">— Devocional</div>
              <div className="font-serif leading-none tracking-tight max-w-[12ch] mb-3.5" style={{ fontSize: 'clamp(32px, 3.5vw, 44px)' }}>Plano de Leitura Bíblica</div>
              <p className="text-[15px] text-white/75 leading-relaxed max-w-[36ch]">30 dias para mergulhar na Palavra junto da nossa comunidade.</p>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-mono text-[11px] tracking-[.14em] text-accent">DIA 01 · GÊNESIS 1</span>
              <span className="w-11 h-11 rounded-full bg-accent text-accent-foreground grid place-items-center group-hover:-rotate-45 transition-transform">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="absolute bottom-8 right-8 font-serif leading-none tracking-tight text-white/[.06] pointer-events-none" style={{ fontSize: 'clamp(80px, 12vw, 160px)' }}>01</span>
          </Link>

          <Link href="/contribua"
            className="group relative overflow-hidden rounded-[22px] md:rounded-[28px] p-9 md:p-10 min-h-[280px] md:min-h-[320px] flex flex-col justify-between bg-surface border border-border hover:-translate-y-1 transition-transform duration-200">
            <div>
              <div className="eyebrow mb-4">— Generosidade</div>
              <div className="font-serif leading-none tracking-tight max-w-[12ch] mb-3.5" style={{ fontSize: 'clamp(32px, 3.5vw, 44px)' }}>Contribua com a obra</div>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[36ch]">Dízimos, ofertas e missões — cada semente plantada transforma vidas reais.</p>
            </div>
            <div className="absolute right-[-40px] top-9 w-[180px] h-[180px] rounded-2xl opacity-40 pointer-events-none" style={{
              background: 'repeating-linear-gradient(0deg, var(--surface-3) 0 8px, transparent 8px 16px), repeating-linear-gradient(90deg, var(--surface-3) 0 8px, transparent 8px 16px)',
            }} />
            <div className="flex items-center justify-between relative z-10">
              <span className="font-mono text-[11px] tracking-[.14em] text-muted-foreground">PIX · CARTÃO · PRESENCIAL</span>
              <span className="w-11 h-11 rounded-full bg-foreground text-background grid place-items-center group-hover:-rotate-45 transition-transform">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ════════ VERSÍCULO ════════ */}
      <section className="py-32 lg:py-40 text-center relative overflow-hidden bg-brand-navy text-white">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 25% 35%, rgba(0,194,255,.18), transparent 60%), radial-gradient(ellipse 50% 40% at 75% 65%, rgba(111,163,255,.14), transparent 60%)',
        }} />
        <div className="relative z-10 max-w-[960px] mx-auto px-6">
          <div className="eyebrow text-accent mb-8">— Palavra viva</div>
          <blockquote className="font-serif font-light leading-[1.1] tracking-tight text-balance" style={{ fontSize: 'clamp(28px, 5.5vw, 76px)' }}>
            &ldquo;<em>{textos.versiculoDestaque}</em>&rdquo;
          </blockquote>
          <cite className="mt-10 inline-block font-mono text-[13px] tracking-[.18em] text-accent uppercase not-italic">
            — {textos.versiculoReferencia}
          </cite>
        </div>
      </section>

      {/* ════════ VISIT CTA ════════ */}
      <section className="py-28 lg:py-32">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10">
          <div className="rounded-[24px] lg:rounded-[32px] overflow-hidden border border-border bg-surface grid grid-cols-1 lg:grid-cols-[5fr_7fr]">
            {/* Google Maps embed */}
            <div className="relative min-h-[240px] lg:min-h-[480px] overflow-hidden bg-surface-2">
              <iframe
                src={getMapsEmbedUrl()}
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', inset: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da igreja no mapa"
              />
            </div>

            {/* Body */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="eyebrow mb-4">— Visite-nos</div>
              <h2 className="display mb-5" style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}>
                Será um prazer<br />receber você.
              </h2>
              <p className="text-base text-muted-foreground leading-[1.6] mb-8 max-w-[50ch]">
                Temos um lugar especial esperando você e sua família. Venha fazer
                parte da nossa comunidade — novos visitantes sempre são bem-vindos.
              </p>

              <div className="flex flex-col gap-3.5 py-5 mb-7 border-y border-border">
                {[
                  { icon: <MapPin className="h-3.5 w-3.5" />, label: 'Endereço', value: formatAddressOneLine(church.endereco) },
                  { icon: <Clock className="h-3.5 w-3.5" />, label: 'Cultos', value: 'Domingos · 9h e 19h · Quartas · 19h30' },
                ].map((r, i) => (
                  <div key={i} className="grid grid-cols-[32px_1fr] md:grid-cols-[32px_110px_1fr] gap-4 items-center text-[14px]">
                    <div className="w-8 h-8 rounded-full bg-surface-2 grid place-items-center">{r.icon}</div>
                    <div className="hidden md:block font-mono text-[10px] tracking-[.14em] uppercase text-muted-foreground">{r.label}</div>
                    <div>{r.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link href="/contato" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">
                  Entre em contato <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/quem-somos" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">O que esperar</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
