'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar, Clock, MapPin, ArrowUpRight,
  Church, Play, PlayCircle, ArrowRight,
} from 'lucide-react'
import { BannerCarousel } from '@/components/banner-carousel'
import { SectionTitle } from '@/components/section-title'
import {
  getBanners,
  getMinisterios,
  getEventos,
  getTextos,
  DEFAULT_TEXTOS,
  type CmsBanner,
  type CmsMinisterio,
  type CmsEvento,
  type CmsTextos,
} from '@/lib/cms'
import { getChurch, formatAddressOneLine } from '@/lib/site-data'
import { getNextEvent, getWeekEvents, countdown, type UpcomingEvent } from '@/lib/next-event'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Próximo evento inteligente — combina recorrentes + cms_eventos
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

    if (ended) {
      // Evento acabou mas getNextEvent ainda o retornou (race condition)
      // Forçar zeros — no próximo tick o getNextEvent vai pular pro próximo
      return { d: 0, h: 0, m: 0, s: 0, event: nextEvt, isImminent: false, isLive: false }
    }

    if (started) {
      // Evento em andamento — mostrar como "ao vivo"
      const c = countdown(now, nextEvt.endDatetime)
      return { ...c, event: nextEvt, isImminent: true, isLive: true }
    }

    // Evento ainda não começou — countdown normal até o início
    const c = countdown(now, nextEvt.datetime)
    const isImminent = nextEvt.datetime.getTime() - now.getTime() < 24 * 60 * 60 * 1000
    return { ...c, event: nextEvt, isImminent, isLive: false }
  }, [now, eventos])
}

export default function Home() {
  const church = getChurch()
  // Hidratamos com defaults estáticos pra não ter flash vazio. O useEffect
  // dispara um fetch contra o Supabase e substitui pelo conteúdo real.
  const [heroBanners, setHeroBanners] = useState<CmsBanner[]>([])
  const [ministerios, setMinisterios] = useState<CmsMinisterio[]>([])
  const [eventos, setEventos] = useState<CmsEvento[]>([])
  const [textos, setTextos] = useState<CmsTextos>(DEFAULT_TEXTOS)

  useEffect(() => {
    let cancelled = false
    Promise.all([getBanners(), getMinisterios(), getEventos(), getTextos()]).then(
      ([b, m, e, t]) => {
        if (cancelled) return
        setHeroBanners(b)
        setMinisterios(m)
        setEventos(e)
        setTextos(t)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const next = useNextEventCountdown(eventos)

  // Eventos da semana para o marquee (filtrado: só futuros desta semana)
  const weekEvents = useMemo(() => getWeekEvents(eventos), [eventos])

  const proximosEventos = [...eventos]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
    .slice(0, 3)
  const ministeriosDestaque = ministerios.slice(0, 6)

  // Filtros para a grid de ministérios (categoria fake derivada)
  const [filter, setFilter] = useState<string>('Todos')
  const cats = ['Todos', 'Adoração', 'Ensino', 'Família', 'Missões']
  const ministeriosFiltrados = filter === 'Todos'
    ? ministeriosDestaque
    : ministeriosDestaque.filter((_, i) => (['Adoração','Ensino','Família','Missões'][i % 4]) === filter)

  return (
    <div className="flex flex-col bg-background">
      {/* ── HERO: editorial, imagem + countdown + rotating banners */}
      <section className="relative pt-6 md:pt-10">
        <BannerCarousel banners={heroBanners} variant="hero" />

        {/* Service card — flutua sobre o hero apenas no desktop. No mobile,
            sentaria em cima da imagem do banner (que já está stackado abaixo do
            texto), então o deixamos abaixo do carrossel. */}
        <div className="relative mt-6 md:-mt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-20">
          <div className="rounded-2xl bg-surface border border-border shadow-xl shadow-primary/5 p-4 md:p-5 grid md:grid-cols-[auto_1fr_auto] gap-4 items-center">
            <div className="flex items-center gap-3">
              <span className={cn(
                'inline-flex items-center gap-2 px-3 h-7 rounded-full text-[11px] font-medium',
                next?.isLive
                  ? 'bg-destructive/20 text-destructive animate-pulse'
                  : 'bg-destructive/10 text-destructive'
              )}>
                <span className="pulse-dot" />
                {next?.isLive
                  ? 'AO VIVO'
                  : next?.isImminent && next.event
                    ? next.event.title.toUpperCase()
                    : 'PRÓXIMO CULTO'}
              </span>
              <div className="hidden md:block w-px h-8 bg-border" />
            </div>
            <div className="grid grid-cols-4 gap-3 md:gap-4 items-center">
              {(['DIAS','HORAS','MIN','SEG'] as const).map((unit, i) => {
                const val = next ? [next.d, next.h, next.m, next.s][i] : 0
                return (
                  <div key={unit} className="text-center">
                    <div className="display text-3xl md:text-4xl font-variant-numeric-tabular text-foreground">
                      {String(val).padStart(2,'0')}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                      {unit}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Link href="/calendario" className="btn-ghost h-10 text-sm">
                Agenda <Calendar className="h-4 w-4" />
              </Link>
              {(() => {
                const url = textos.botaoAssistirUrl || '/eventos'
                const label = textos.botaoAssistirRotulo || 'Assistir'
                const aoVivo = textos.botaoAssistirAoVivo === 'true'
                const isExternal = url.startsWith('http')
                const cls = aoVivo
                  ? 'btn-primary h-10 text-sm bg-destructive hover:bg-destructive/90 animate-pulse'
                  : 'btn-primary h-10 text-sm'
                if (isExternal) {
                  return (
                    <a href={url} target="_blank" rel="noreferrer" className={cls}>
                      <Play className="h-4 w-4" /> {aoVivo ? '🔴 ' : ''}{label}
                    </a>
                  )
                }
                return (
                  <Link href={url} className={cls}>
                    <Play className="h-4 w-4" /> {aoVivo ? '🔴 ' : ''}{label}
                  </Link>
                )
              })()}
            </div>
          </div>

          {/* Marquee de horários da semana */}
          <div className="mt-3 overflow-hidden rounded-full border border-border bg-surface">
            {weekEvents.length > 0 ? (
              <div className="animate-marquee whitespace-nowrap py-2.5 flex gap-8 pr-8 w-max">
                {[...weekEvents, ...weekEvents].map((e, i) => (
                  <span key={i} className="inline-flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                    <span className="font-medium">{e.weekday}</span>
                    <span className="text-muted-foreground">{e.time} · {e.title}</span>
                    <span className="text-border">•</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="py-2.5 text-center text-sm text-muted-foreground">
                Sem mais eventos esta semana —{' '}
                <Link href="/eventos" className="text-primary hover:underline">
                  veja a programação completa
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── BOAS-VINDAS editorial */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="eyebrow mb-5 flex items-center gap-2">
                <Church className="h-3.5 w-3.5" /> PIB Capim Grosso · desde 1978
              </div>
              <h2 className="display text-5xl md:text-6xl lg:text-7xl text-balance mb-8">
                Um lugar para <em className="not-italic text-brand-gradient">voltar pra casa</em>.
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/quem-somos" className="btn-primary">
                  Conheça-nos <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/visao" className="btn-ghost">Nossa Visão</Link>
              </div>
            </div>
            <div className="lg:col-span-7 lg:pt-16">
              <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-6 text-pretty">
                A Primeira Igreja Batista de Capim Grosso é um lugar onde você pode encontrar paz,
                comunhão e crescimento espiritual. Aqui, todas as pessoas são bem-vindas —
                independentemente de sua história.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-10 text-pretty">
                Nossa missão é proclamar o Evangelho de Jesus Cristo, fazer discípulos e
                transformar vidas através do amor e da graça de Deus.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { k: 'Amor',     v: 'Compartilhando o amor de Cristo' },
                  { k: 'Comunhão', v: 'Crescendo juntos em família' },
                  { k: 'Palavra',  v: 'Fundamentados na Bíblia' },
                  { k: 'Missões',  v: 'Alcançando vidas para Cristo' },
                ].map((f) => (
                  <div key={f.k} className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                      — {f.k}
                    </div>
                    <div className="text-sm leading-snug">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PASTOR: split editorial */}
      <section className="py-24 md:py-32 bg-surface-2 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border bg-brand-gradient">
                <Image
                  src="/pastor-silas.png"
                  alt="Pr. Silas"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-top"
                />
                {/* Gradiente garante contraste do texto branco no rodapé */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 h-7 rounded-full bg-background/95 backdrop-blur border border-border text-[11px] font-medium text-foreground">
                  <span className="pulse-dot" /> Pastor Presidente
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="text-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider opacity-80">Liderando desde</div>
                    <div className="display text-2xl drop-shadow-md">Pr. Silas Barreto</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="eyebrow mb-3">— Liderança</div>
              <h2 className="display text-5xl md:text-6xl lg:text-7xl mb-6 text-balance">
                Liderando com fé,<br/>servindo com amor.
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                Sob a liderança do Pastor Silas, a PIBAC tem vivido um tempo de crescimento
                espiritual, fortalecimento das famílias e avanço missionário na nossa região.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                Ele dedica sua vida à pregação fiel da Palavra, ao cuidado pastoral e à
                formação de novos discípulos para a glória de Deus.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pastor" className="btn-primary">
                  Conhecer o pastor <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button className="btn-ghost">
                  <PlayCircle className="h-4 w-4" /> Última mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINISTÉRIOS com filtros */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="eyebrow mb-3">— Nossos Ministérios</div>
              <h2 className="display text-4xl md:text-5xl lg:text-6xl text-balance max-w-2xl">
                Encontre o seu lugar para servir.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button key={c}
                  onClick={() => setFilter(c)}
                  className={`h-9 px-4 rounded-full text-sm border transition-colors ${
                    filter === c
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface border-border hover:border-foreground'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ministeriosFiltrados.map((m, i) => (
              <Link key={m.id} href={`/ministerios#${m.id}`}
                className="group card-soft overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${m.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 font-mono text-[11px] text-white/90 uppercase tracking-wider">
                    /{String(i + 1).padStart(2,'0')}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="display text-2xl">{m.name}</h3>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{m.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/ministerios" className="btn-ghost">
              Ver todos os ministérios <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── EVENTOS */}
      <section className="py-24 md:py-32 bg-surface-2 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="— Próximos Eventos" title="Participe e cresça conosco."
            subtitle="Encontros, celebrações e formações abertas à comunidade." centered={false} />

          {proximosEventos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Nenhum evento agendado no momento.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {proximosEventos.map((e) => (
                <article key={e.id} className="group card-soft overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                         style={{ backgroundImage: e.imageUrl ? `url(${e.imageUrl})` : undefined }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 left-4 flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-surface/95 backdrop-blur text-foreground border border-border">
                      <span className="display text-xl leading-none">{format(parseISO(e.date), 'dd')}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider mt-1 text-muted-foreground">
                        {format(parseISO(e.date), 'MMM', { locale: ptBR }).replace('.', '')}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="display text-2xl mb-2">{e.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">{e.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {e.time}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-12">
            <Link href="/eventos" className="btn-primary">Ver todos os eventos <ArrowUpRight className="h-4 w-4" /></Link>
            <Link href="/calendario" className="btn-ghost"><Calendar className="h-4 w-4" /> Calendário interativo</Link>
          </div>
        </div>
      </section>

      {/* ── Banner inline + cards duplos */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-5">
          <Link href="/plano-leitura"
            className="group relative overflow-hidden rounded-3xl p-8 md:p-10 bg-brand-gradient text-white min-h-[260px] flex flex-col justify-between">
            <div className="absolute -top-20 -right-20 h-64 w-64 bg-accent/30 rounded-full blur-3xl" />
            <div>
              <div className="eyebrow text-accent mb-3">— Devocional</div>
              <h3 className="display text-3xl md:text-4xl text-balance mb-3 max-w-xs">
                Plano de Leitura Bíblica
              </h3>
              <p className="opacity-80 max-w-sm">30 dias para mergulhar na Palavra conosco.</p>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-mono text-xs text-accent">DIA 1 · GÊNESIS</span>
              <span className="h-10 w-10 rounded-full bg-white text-primary grid place-items-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link href="/contribua"
            className="group relative overflow-hidden rounded-3xl p-8 md:p-10 bg-surface border border-border min-h-[260px] flex flex-col justify-between">
            <div>
              <div className="eyebrow mb-3">— Generosidade</div>
              <h3 className="display text-3xl md:text-4xl text-balance mb-3 max-w-xs">
                Contribua com a obra
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Dízimos, ofertas e missões — cada semente transforma vidas.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">PIX · CARTÃO · PRESENCIAL</span>
              <span className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── VERSÍCULO editorial */}
      <section className="py-28 md:py-40 bg-[#07091A] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #00C2FF 0%, transparent 45%), radial-gradient(circle at 80% 70%, #6FA3FF 0%, transparent 45%)' }} />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow text-accent mb-6">— Palavra viva</div>
          <blockquote className="display text-3xl md:text-5xl lg:text-6xl leading-[1.1] text-balance">
            &ldquo;{textos.versiculoDestaque}&rdquo;
          </blockquote>
          <cite className="mt-8 inline-block font-mono text-sm text-accent tracking-wider not-italic">
            — {textos.versiculoReferencia}
          </cite>
        </div>
      </section>

      {/* ── CTA final / visite */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-border bg-surface">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[280px] lg:min-h-[440px] bg-surface-2">
                <div className="absolute inset-0 bg-cover bg-center"
                     style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80)' }} />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 via-primary/10 to-transparent" />
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 h-7 rounded-full bg-background/95 border border-border text-[11px]">
                  <MapPin className="h-3 w-3" /> R. Eldorado, 30 · Capim Grosso
                </div>
              </div>
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <div className="eyebrow mb-4">— Visite-nos</div>
                <h2 className="display text-4xl md:text-5xl mb-5 text-balance">
                  Será um prazer receber você.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
                  Temos um lugar especial esperando você e sua família.
                  Venha fazer parte da nossa comunidade — novos visitantes sempre são bem-vindos.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-9 w-9 rounded-full bg-surface-2 grid place-items-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>{formatAddressOneLine(church.endereco)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-9 w-9 rounded-full bg-surface-2 grid place-items-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span>Domingos · 9h e 19h</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contato" className="btn-primary">
                    Entre em contato <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/quem-somos" className="btn-ghost">O que esperar</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
