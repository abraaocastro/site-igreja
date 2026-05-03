'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, ArrowUpRight } from 'lucide-react'
import { getChurch, mailtoHref, type Church } from '@/lib/site-data'
import { getChurchEffective } from '@/lib/cms'

export default function PastorPage() {
  const [church, setChurch] = useState<Church>(() => getChurch())
  useEffect(() => { let c = false; getChurchEffective().then(v => { if (!c) setChurch(v) }); return () => { c = true } }, [])

  const { pastor, contato } = church
  const instagramHandle = pastor.instagram ? '@' + pastor.instagram.replace(/\/$/, '').split('/').pop() : null

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-[72px] items-center">
            {/* Portrait */}
            <div className="relative aspect-[4/5] rounded-[22px] lg:rounded-[28px] overflow-hidden bg-brand-gradient" style={{ boxShadow: '0 36px 80px -36px rgba(11,16,32,.35)' }}>
              <Image src={pastor.foto} alt={`${pastor.titulo} ${pastor.nome}`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" priority unoptimized={pastor.foto.startsWith('http')} />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
              <span className="absolute top-[18px] left-[18px] inline-flex items-center gap-2 h-[30px] px-3 rounded-full bg-background/95 backdrop-blur border border-border text-[11px] font-medium">
                <span className="pulse-dot" /> {pastor.titulo}
              </span>
              <div className="absolute left-[18px] right-[18px] bottom-[18px] text-white">
                <div className="font-serif text-[22px] lg:text-[28px] leading-none tracking-tight">Pr. {pastor.nome}</div>
              </div>
            </div>

            {/* Copy */}
            <div>
              <div className="eyebrow mb-4">— Liderança</div>
              <h1 className="display mb-6" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
                Pr. {pastor.nome.split(' ')[0]}<br /><em className="text-brand-gradient">{pastor.nome.split(' ').slice(1).join(' ')}</em>
              </h1>

              <div className="space-y-4 text-[17px] text-muted-foreground leading-[1.65] max-w-[52ch]">
                {pastor.bio.map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>

              <blockquote className="mt-10 pl-7 py-1 border-l-2 border-accent bg-accent/[.05] rounded-r-[14px] pr-7 relative max-w-[48ch]">
                <span className="absolute top-[-8px] left-4 font-serif text-[60px] text-accent/50 leading-none">&ldquo;</span>
                <p className="font-serif text-[20px] leading-[1.35] tracking-tight italic pt-4 pb-3">
                  A igreja é o lugar onde a graça de Deus encontra vidas reais — e nenhuma delas chega tarde demais.
                </p>
              </blockquote>

              <div className="flex flex-wrap gap-2.5 mt-8">
                {pastor.instagram && (
                  <a href={pastor.instagram} target="_blank" rel="noreferrer" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">
                    <Instagram className="h-4 w-4" /> {instagramHandle}
                  </a>
                )}
                <Link href="/contato" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">
                  Agendar conversa <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Agende uma <em className="italic">conversa.</em></h2>
          <p className="text-muted-foreground max-w-[46ch] mx-auto mb-8">O Pastor está disponível para atendimento pastoral, aconselhamento e orientação espiritual.</p>
          <Link href="/contato" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Entrar em contato <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  )
}
