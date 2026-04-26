'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Heart, PiggyBank, HandCoins, Gift, QrCode, Landmark, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getChurch, type Church, type PixTipo } from '@/lib/site-data'
import { getChurchEffective } from '@/lib/cms'

const METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'banco', label: 'Transferência', icon: Landmark },
  { id: 'presencial', label: 'Presencial', icon: Gift },
]

export default function ContribuaPage() {
  const [method, setMethod] = useState<string>('pix')
  const [tipo, setTipo] = useState<'dizimo' | 'oferta' | 'missoes'>('dizimo')
  const [copiado, setCopiado] = useState<string | null>(null)
  // Default sync do JSON pra evitar flash; useEffect substitui pelo efetivo (CMS).
  const [church, setChurch] = useState<Church>(() => getChurch())

  useEffect(() => {
    let cancelled = false
    getChurchEffective().then((c) => {
      if (!cancelled) setChurch(c)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiado(key)
    toast.success('Copiado!')
    setTimeout(() => setCopiado(null), 2000)
  }

  // Considera PIX configurado se a chave não estiver vazia nem no formato TODO.
  // (Avaliado a partir do `church` efetivo — admin pode ter sobrescrito via CMS.)
  const chavePix = church.pix.chave
  const pixConfigured = isPixConfigured(chavePix)
  const pixTipoLabel: Record<PixTipo, string> = {
    email: 'E-mail',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    telefone: 'Telefone',
    aleatoria: 'Chave aleatória',
  }
  // Dados bancários: ainda não foram fornecidos pela tesouraria.
  const bancoConfigured = false

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
              {pixConfigured ? (
                <div className="grid md:grid-cols-[240px_1fr] gap-6 items-start">
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border border-border">
                    <div className="text-center">
                      <QrCode className="h-24 w-24 text-primary mx-auto" />
                      <p className="text-xs text-muted-foreground mt-2">QR Code PIX</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Titular</p>
                    <p className="text-sm font-medium text-foreground mb-3">{church.pix.titular}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Chave PIX ({pixTipoLabel[church.pix.tipo]})
                    </p>
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
                    <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-sm text-foreground">
                      <strong>Dica:</strong> No campo &quot;mensagem&quot; do PIX, informe se é dízimo, oferta ou missões
                      para facilitar a identificação.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-10 px-4 rounded-xl bg-muted border border-dashed border-border">
                  <div className="h-14 w-14 rounded-full bg-accent/15 text-primary flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">Chave PIX em configuração</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    A tesouraria está finalizando os dados da chave PIX institucional. Em breve
                    você poderá contribuir diretamente por aqui. Enquanto isso, use a opção
                    &quot;Presencial&quot; ou fale conosco.
                  </p>
                </div>
              )}
            </div>
          )}

          {method === 'banco' && (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-foreground mb-4">Dados Bancários</h3>
              {bancoConfigured ? (
                <p className="text-muted-foreground">Configurando dados bancários...</p>
              ) : (
                <div className="flex flex-col items-center text-center py-10 px-4 rounded-xl bg-muted border border-dashed border-border">
                  <div className="h-14 w-14 rounded-full bg-accent/15 text-primary flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">Dados bancários em configuração</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    A conta institucional ainda está sendo preparada para divulgação pública. Em
                    breve disponibilizaremos aqui os dados para transferência.
                  </p>
                </div>
              )}
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

/**
 * Checagem da chave PIX em runtime (admin pode ter sobrescrito via CMS).
 * Independente do helper estático `hasPix()`, que olha o JSON.
 */
function isPixConfigured(chave: string): boolean {
  if (!chave) return false
  const trimmed = chave.trim()
  if (trimmed === '') return false
  if (trimmed.toUpperCase().includes('TODO')) return false
  return true
}
