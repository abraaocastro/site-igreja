'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHistoria, getTextos, type CmsHistoriaEntry, type CmsTextos } from '@/lib/cms'
import { cn } from '@/lib/utils'

const DEFAULT_INTRO = {
  historiaIntroTitulo: 'Uma Jornada de Fé',
  historiaIntroSubtitulo: 'Da pequena reunião em uma casa até a igreja vibrante que somos hoje',
  historiaIntroTexto: 'A história da Primeira Igreja Batista de Capim Grosso é uma história de fé, perseverança e amor. Desde o início, quando um pequeno grupo de fiéis se reunia para buscar a Deus, até os dias de hoje, onde centenas de pessoas se encontram semanalmente para adorar, a mão de Deus tem guiado cada passo desta congregação.',
  historiaCitacao: 'Até aqui nos ajudou o Senhor',
  historiaCitacaoRef: '1 Samuel 7:12',
  historiaCitacaoTexto: 'Olhamos para trás com gratidão pelo que Deus fez, vivemos o presente com fé e olhamos para o futuro com esperança.',
}

export default function HistoriaPage() {
  const [timeline, setTimeline] = useState<CmsHistoriaEntry[]>([])
  const [textos, setTextos] = useState<CmsTextos>(DEFAULT_INTRO)

  useEffect(() => {
    let cancelled = false
    Promise.all([getHistoria(), getTextos()]).then(([t, x]) => {
      if (!cancelled) { setTimeline(t); setTextos({ ...DEFAULT_INTRO, ...x }) }
    })
    return () => { cancelled = true }
  }, [])

  const introTitulo = textos.historiaIntroTitulo || DEFAULT_INTRO.historiaIntroTitulo
  const introTexto = textos.historiaIntroTexto || DEFAULT_INTRO.historiaIntroTexto
  const citacao = textos.historiaCitacao || DEFAULT_INTRO.historiaCitacao
  const citacaoRef = textos.historiaCitacaoRef || DEFAULT_INTRO.historiaCitacaoRef

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-3xl">
            <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Nossa história</div>
            <h1 className="display mb-6" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              {introTitulo.split(' ').slice(0, 2).join(' ')}<br />
              <em className="text-brand-gradient">{introTitulo.split(' ').slice(2).join(' ') || 'de Fé'}.</em>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[56ch]">{introTexto}</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 md:px-10">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {timeline.map((item, index) => (
              <div key={item.id} className={cn(
                'relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-14 last:mb-0',
                index % 2 === 0 ? '' : 'md:direction-rtl'
              )}>
                {/* Dot */}
                <div className="absolute left-5 md:left-1/2 w-3 h-3 bg-foreground rounded-full -translate-x-1/2 mt-2 z-10 ring-4 ring-surface-2" />

                {/* Content */}
                <div className={cn('ml-12 md:ml-0', index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:direction-ltr')}>
                  <div className="card-soft rounded-[18px] overflow-hidden hover:!transform-none">
                    {item.imageUrl && (
                      <div className="aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                    )}
                    <div className="p-6">
                      <span className="inline-block font-serif text-[32px] leading-none tracking-tight text-primary mb-2">{item.year}</span>
                      <h3 className="font-serif text-xl tracking-tight mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>

                {/* Spacer */}
                <div className="hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citação */}
      <section className="py-24 md:py-32 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,194,255,.12), transparent 60%)',
        }} />
        <div className="relative z-10 max-w-[800px] mx-auto px-6">
          <blockquote className="font-serif italic leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(28px, 5vw, 64px)' }}>
            &ldquo;{citacao}&rdquo;
          </blockquote>
          <cite className="mt-6 inline-block font-mono text-[12px] tracking-[.18em] text-accent uppercase not-italic">— {citacaoRef}</cite>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Faça parte desta <em className="italic">história.</em></h2>
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            <Link href="/contato" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Visite-nos <ArrowUpRight className="h-4 w-4" /></Link>
            <Link href="/quem-somos" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Quem somos</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
