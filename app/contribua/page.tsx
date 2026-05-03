'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ArrowUpRight, QrCode, Landmark, Gift } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getChurch, type Church, type PixTipo } from '@/lib/site-data'
import { getChurchEffective } from '@/lib/cms'

export default function ContribuaPage() {
  const [method, setMethod] = useState('pix')
  const [copiado, setCopiado] = useState<string | null>(null)
  const [church, setChurch] = useState<Church>(() => getChurch())

  useEffect(() => { let c = false; getChurchEffective().then(v => { if (!c) setChurch(v) }); return () => { c = true } }, [])

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiado(key)
    toast.success('Copiado!')
    setTimeout(() => setCopiado(null), 2000)
  }

  const chavePix = church.pix.chave
  const pixConfigured = chavePix && !chavePix.startsWith('TODO')
  const pixTipoLabel: Record<PixTipo, string> = { email: 'E-mail', cpf: 'CPF', cnpj: 'CNPJ', telefone: 'Telefone', aleatoria: 'Chave aleatória' }

  const methods = [
    { id: 'pix', label: 'PIX', icon: QrCode },
    { id: 'banco', label: 'Transferência', icon: Landmark },
    { id: 'presencial', label: 'Presencial', icon: Gift },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-3xl">
            <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Generosidade</div>
            <h1 className="display mb-5" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              Contribua com<br />a <em className="text-brand-gradient">obra.</em>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[52ch]">
              Dízimos, ofertas e missões — cada semente plantada transforma vidas reais na nossa comunidade e além.
            </p>
          </div>
        </div>
      </section>

      {/* Methods */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          {/* Method tabs */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-surface-2 rounded-full w-fit mb-10">
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={cn('h-[38px] px-4 rounded-full text-[13px] font-medium transition-all border-0 cursor-pointer inline-flex items-center gap-2',
                  method === m.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                <m.icon className="h-3.5 w-3.5" /> {m.label}
              </button>
            ))}
          </div>

          <div className="max-w-2xl">
            {method === 'pix' && (
              <div className="card-soft rounded-[22px] p-8 space-y-6 hover:!transform-none">
                <div>
                  <h2 className="font-serif text-2xl tracking-tight mb-2">PIX</h2>
                  <p className="text-sm text-muted-foreground">A forma mais rápida e prática de contribuir.</p>
                </div>
                {pixConfigured ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-[14px] bg-surface-2">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-1">
                          Chave PIX ({pixTipoLabel[church.pix.tipo]})
                        </div>
                        <div className="font-mono text-base font-medium break-all">{chavePix}</div>
                      </div>
                      <button onClick={() => copy(chavePix, 'pix')}
                        className={cn('w-10 h-10 rounded-full grid place-items-center transition-all shrink-0 ml-3',
                          copiado === 'pix' ? 'bg-accent text-accent-foreground' : 'bg-foreground text-background hover:-translate-y-0.5')}>
                        {copiado === 'pix' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground tracking-wider">
                      TITULAR: {church.pix.titular}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-[14px] bg-surface-2 text-center">
                    <p className="text-muted-foreground text-sm">Chave PIX em configuração.</p>
                    <p className="text-xs text-muted-foreground mt-1">Entre em contato com a secretaria.</p>
                  </div>
                )}
              </div>
            )}

            {method === 'banco' && (
              <div className="card-soft rounded-[22px] p-8 space-y-6 hover:!transform-none">
                <div>
                  <h2 className="font-serif text-2xl tracking-tight mb-2">Transferência Bancária</h2>
                  <p className="text-sm text-muted-foreground">Entre em contato com a secretaria para os dados bancários.</p>
                </div>
                <div className="p-6 rounded-[14px] bg-surface-2 text-center">
                  <p className="text-muted-foreground text-sm">Dados bancários disponíveis na secretaria.</p>
                  <Link href="/contato" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">Fale conosco →</Link>
                </div>
              </div>
            )}

            {method === 'presencial' && (
              <div className="card-soft rounded-[22px] p-8 space-y-6 hover:!transform-none">
                <div>
                  <h2 className="font-serif text-2xl tracking-tight mb-2">Contribuição Presencial</h2>
                  <p className="text-sm text-muted-foreground">Você pode contribuir durante nossos cultos.</p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Nossos cultos acontecem nos seguintes horários:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { d: 'Domingos', h: '9h e 19h' },
                      { d: 'Quartas', h: '19h30' },
                    ].map(c => (
                      <div key={c.d} className="p-4 rounded-[14px] bg-surface-2">
                        <div className="font-mono text-[11px] text-accent tracking-wider uppercase">{c.d}</div>
                        <div className="font-serif text-lg tracking-tight mt-1">{c.h}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Versículo */}
      <section className="py-20 md:py-28 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,194,255,.12), transparent 60%)',
        }} />
        <div className="relative z-10 max-w-[700px] mx-auto px-6">
          <blockquote className="font-serif italic leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(22px, 4vw, 44px)' }}>
            &ldquo;Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.&rdquo;
          </blockquote>
          <cite className="mt-6 inline-block font-mono text-[12px] tracking-[.18em] text-accent uppercase not-italic">— 2 Coríntios 9:7</cite>
        </div>
      </section>
    </div>
  )
}
