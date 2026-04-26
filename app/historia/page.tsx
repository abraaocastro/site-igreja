'use client'

import { useEffect, useState } from 'react'
import { SectionTitle } from '@/components/section-title'
import { BannerCarousel } from '@/components/banner-carousel'
import { getHistoria, getTextos, type CmsHistoriaEntry, type CmsTextos } from '@/lib/cms'

const DEFAULT_INTRO = {
  historiaIntroTitulo: 'Uma Jornada de Fé',
  historiaIntroSubtitulo: 'Da pequena reunião em uma casa até a igreja vibrante que somos hoje',
  historiaIntroTexto:
    'A história da Primeira Igreja Batista de Capim Grosso é uma história de fé, perseverança e amor. Desde o início, quando um pequeno grupo de fiéis se reunia para buscar a Deus, até os dias de hoje, onde centenas de pessoas se encontram semanalmente para adorar, a mão de Deus tem guiado cada passo desta congregação.',
  historiaCitacao: 'Até aqui nos ajudou o Senhor',
  historiaCitacaoRef: '1 Samuel 7:12',
  historiaCitacaoTexto:
    'Olhamos para trás com gratidão pelo que Deus fez, vivemos o presente com fé e olhamos para o futuro com esperança, sabendo que Ele continua a nos guiar.',
}

export default function HistoriaPage() {
  const [timeline, setTimeline] = useState<CmsHistoriaEntry[]>([])
  const [textos, setTextos] = useState<CmsTextos>(DEFAULT_INTRO)

  useEffect(() => {
    let cancelled = false
    Promise.all([getHistoria(), getTextos()]).then(([t, x]) => {
      if (cancelled) return
      setTimeline(t)
      // mescla os textos vindos do CMS por cima dos defaults
      setTextos({ ...DEFAULT_INTRO, ...x })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const introTitulo = textos.historiaIntroTitulo || DEFAULT_INTRO.historiaIntroTitulo
  const introSubtitulo = textos.historiaIntroSubtitulo || DEFAULT_INTRO.historiaIntroSubtitulo
  const introTexto = textos.historiaIntroTexto || DEFAULT_INTRO.historiaIntroTexto
  const citacao = textos.historiaCitacao || DEFAULT_INTRO.historiaCitacao
  const citacaoRef = textos.historiaCitacaoRef || DEFAULT_INTRO.historiaCitacaoRef
  const citacaoTexto = textos.historiaCitacaoTexto || DEFAULT_INTRO.historiaCitacaoTexto

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80)' }}
        >
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-4">
            Nossa História
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Mais de 50 anos de fé, amor e serviço a Deus e à comunidade
          </p>
        </div>
      </section>

      {/* Introdução */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle title={introTitulo} subtitle={introSubtitulo} />
          <p className="text-muted-foreground text-lg whitespace-pre-line">{introTexto}</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Linha central */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 md:-translate-x-0.5" />

            {timeline.map((item, index) => (
              <div
                key={item.id}
                className={`relative flex flex-col md:flex-row gap-8 mb-12 last:mb-0 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Ponto na linha */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 mt-2 z-10 ring-4 ring-background" />

                {/* Conteúdo */}
                <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                    {item.imageUrl && (
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                      />
                    )}
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full mb-3">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>

                {/* Espaçador para alinhamento */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citação */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif italic mb-4">
            &ldquo;{citacao}&rdquo;
          </blockquote>
          <cite className="text-lg opacity-90">{citacaoRef}</cite>
          <p className="mt-6 opacity-80 max-w-2xl mx-auto">{citacaoTexto}</p>
        </div>
      </section>

      {/* Banner */}
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BannerCarousel
            banners={[
              {
                id: '1',
                title: 'Faça Parte Desta História',
                subtitle: 'Venha construir conosco os próximos capítulos',
                imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80',
                link: '/quem-somos',
                buttonText: 'Conheça-nos',
              },
            ]}
            variant="inline"
          />
        </div>
      </section>
    </div>
  )
}
