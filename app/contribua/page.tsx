'use client'

import { useState } from 'react'
import { Copy, Check, Heart, PiggyBank, HandCoins, Gift, QrCode, Landmark } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'banco', label: 'Transferência', icon: Landmark },
  { id: 'presencial', label: 'Presencial', icon: Gift },
]

const VALORES_RAPIDOS = [25, 50, 100, 200, 500]

export default function ContribuaPage() {
  const [method, setMethod] = useState<string>('pix')
  const [valor, setValor] = useState<number | ''>('')
  const [tipo, setTipo] = useState<'dizimo' | 'oferta' | 'missoes'>('dizimo')
  const [copiado, setCopiado] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiado(key)
    toast.success('Copiado!')
    setTimeout(() => setCopiado(null), 2000)
  }

  const chavePix = 'tesouraria@pibcapimgrosso.com.br'
  const banco = {
    nome: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '67890-1',
    titular: 'Primeira Igreja Batista de Capim Grosso',
    cnpj: '00.000.000/0001-00',
  }

  return (
    <div>
      <section className="relative bg-brand-gradient text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 h-96 w-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-4">
            <Heart className="h-4 w-4 text-destructive fill-destructive" />
            Contribua com a obra
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Sua oferta faz diferença
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Contribua com dízimos, ofertas e missões. Cada semente plantada transforma vidas.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Tipo de contribuição */}
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {[
              { id: 'dizimo' as const, label: 'Dízimo', icon: PiggyBank, text: 'Dedicação fiel ao Senhor' },
              { id: 'oferta' as const, label: 'Oferta', icon: Gift, text: 'Gratidão e adoração' },
              { id: 'missoes' as const, label: 'Missões', icon: HandCoins, text: 'Alcançando vidas' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={cn(
                  'text-left p-5 rounded-xl border-2 transition',
                  tipo === t.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-accent/50'
                )}
              >
                <t.icon className={cn('h-6 w-6 mb-2', tipo === t.id ? 'text-primary' : 'text-muted-foreground')} />
                <p className="font-semibold text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.text}</p>
              </button>
            ))}
          </div>

          {/* Valor sugerido */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
            <p className="text-sm font-medium text-foreground mb-3">Valor sugerido (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {VALORES_RAPIDOS.map((v) => (
                <button
                  key={v}
                  onClick={() => setValor(v)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition',
                    valor === v
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-muted text-foreground hover:bg-accent/20'
                  )}
                >
                  R$ {v}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Outro valor"
                  className="w-32 px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>
          </div>

          {/* Método */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition',
                  method === m.id
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Conteúdo por método */}
          {method === 'pix' && (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-foreground mb-4">Contribua via PIX</h3>
              <div className="grid md:grid-cols-[240px_1fr] gap-6 items-start">
                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border border-border">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">QR Code PIX</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Chave PIX (E-mail)</p>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted border border-border">
                    <code className="flex-1 text-sm text-foreground break-all">{chavePix}</code>
                    <button
                      onClick={() => copy(chavePix, 'pix')}
                      className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                      aria-label="Copiar chave"
                    >
                      {copiado === 'pix' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {valor && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Ao realizar a transferência, informe o valor de{' '}
                      <strong className="text-primary">R$ {Number(valor).toFixed(2)}</strong> e a categoria{' '}
                      <strong className="text-primary capitalize">{tipo}</strong> no campo de mensagem.
                    </p>
                  )}
                  <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-sm text-foreground">
                    <strong>Dica:</strong> No campo &quot;mensagem&quot; do PIX, informe se é dízimo, oferta ou missões
                    para facilitar a identificação.
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === 'banco' && (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-foreground mb-4">Dados Bancários</h3>
              <div className="space-y-3">
                {[
                  ['Titular', banco.titular],
                  ['CNPJ', banco.cnpj],
                  ['Banco', banco.nome],
                  ['Agência', banco.agencia],
                  ['Conta Corrente', banco.conta],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-3 rounded-md bg-muted border border-border"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                    <button
                      onClick={() => copy(value, label)}
                      className="p-2 rounded-md hover:bg-card"
                      aria-label={`Copiar ${label}`}
                    >
                      {copiado === label ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {method === 'presencial' && (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-foreground mb-4">Contribuição Presencial</h3>
              <p className="text-muted-foreground mb-4">
                Durante os cultos, você pode entregar suas ofertas diretamente nos envelopes
                disponibilizados nos assentos ou na tesouraria.
              </p>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="font-semibold text-foreground mb-1">Horários dos cultos</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Domingo — 9h (EBD) e 19h (Celebração)</li>
                  <li>Quarta-feira — 19h30 (Estudo Bíblico)</li>
                  <li>Sábado — 19h30 (Jovens)</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-10 p-6 rounded-2xl bg-brand-gradient text-white text-center">
            <p className="italic font-serif text-lg md:text-xl">
              &ldquo;Cada um contribua segundo propôs no seu coração, não com tristeza ou por
              necessidade; porque Deus ama o que dá com alegria.&rdquo;
            </p>
            <p className="mt-2 opacity-90 text-sm">— 2 Coríntios 9:7</p>
          </div>
        </div>
      </section>
    </div>
  )
}
