'use client'

import { useState, FormEvent } from 'react'
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Facebook, Instagram, Youtube, Loader2, Navigation, ExternalLink } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { toast } from 'sonner'
import {
  getChurch,
  formatAddressTwoLines,
  formatPhone,
  telHref,
  mailtoHref,
  getMapsEmbedUrl,
  getMapsDirectionsUrl,
  getMapsSearchUrl,
} from '@/lib/site-data'

export default function ContatoPage() {
  const church = getChurch()
  const { endereco, contato, social } = church
  const [enderecoLine1, enderecoLine2] = formatAddressTwoLines(endereco)
  const phoneDisplay = formatPhone(contato.telefone)
  const phoneLink = telHref(contato.telefone)
  const emailLink = mailtoHref(contato.email)
  const mapsEmbedUrl = getMapsEmbedUrl()
  const mapsDirectionsUrl = getMapsDirectionsUrl()
  const mapsSearchUrl = getMapsSearchUrl()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 900))
    setSending(false)
    toast.success('Mensagem enviada! Retornaremos em breve.')
    setForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })
  }

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const baseInput =
    'w-full px-4 py-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition text-sm'

  return (
    <div>
      <section className="relative bg-brand-gradient text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -bottom-20 left-0 h-96 w-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-4">
            <MessageSquare className="h-4 w-4 text-accent" />
            Fale com a gente
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">Entre em Contato</h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Tire suas dúvidas, marque uma visita ou deixe um pedido de oração.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Info de contato */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <SectionTitle title="Como nos encontrar" centered={false} className="mb-6" />
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Endereço</p>
                    <p className="text-sm text-muted-foreground">{enderecoLine1}</p>
                    <p className="text-sm text-muted-foreground">{enderecoLine2}</p>
                  </div>
                </li>
                {phoneLink && (
                  <li className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Telefone</p>
                      <a
                        href={phoneLink}
                        className="text-sm text-muted-foreground hover:text-primary transition"
                      >
                        {phoneDisplay}
                      </a>
                    </div>
                  </li>
                )}
                {emailLink && (
                  <li className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">E-mail</p>
                      <a
                        href={emailLink}
                        className="text-sm text-muted-foreground hover:text-primary transition break-all"
                      >
                        {contato.email}
                      </a>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Horários</p>
                    <p className="text-sm text-muted-foreground">Domingo: 9h e 19h</p>
                    <p className="text-sm text-muted-foreground">Quarta: 19h30 | Sábado: 19h30 (Jovens)</p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Siga-nos no Instagram</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition"
                  >
                    <div className="h-9 w-9 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">A Igreja</p>
                      <p className="text-xs text-muted-foreground truncate">@pibaccapimgrosso</p>
                    </div>
                  </a>
                  <a
                    href={social.instagramPastor}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition"
                  >
                    <div className="h-9 w-9 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Pastor Silas Barreto</p>
                      <p className="text-xs text-muted-foreground truncate">@prsilasbarreto</p>
                    </div>
                  </a>
                  <a
                    href={social.instagramJovens}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition"
                  >
                    <div className="h-9 w-9 rounded-full bg-accent/15 text-primary flex items-center justify-center shrink-0">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Rede de Jovens</p>
                      <p className="text-xs text-muted-foreground truncate">@rdjmbc</p>
                    </div>
                  </a>
                  {(social.facebook || social.youtube) && (
                    <div className="flex gap-2 pt-2">
                      {social.facebook && (
                        <a
                          href={social.facebook}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Facebook"
                          className="h-10 w-10 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center text-muted-foreground hover:text-primary transition"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      {social.youtube && (
                        <a
                          href={social.youtube}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="YouTube"
                          className="h-10 w-10 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center text-muted-foreground hover:text-primary transition"
                        >
                          <Youtube className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="relative">
                <iframe
                  title={`Localização ${church.nomeCurto} — ${enderecoLine1}`}
                  src={mapsEmbedUrl}
                  className="w-full aspect-[4/3] border-0 block"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2 bg-card border-t border-border">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md font-semibold text-sm hover:bg-primary/90 transition shadow-sm hover:shadow-md hover:shadow-primary/30"
                >
                  <Navigation className="h-4 w-4" />
                  Como chegar
                </a>
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-border hover:border-primary hover:bg-primary/5 px-4 py-2.5 rounded-md font-medium text-sm text-foreground transition"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir no Maps
                </a>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
            <SectionTitle title="Envie uma mensagem" centered={false} className="mb-6" />
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nome *</label>
                  <input required value={form.nome} onChange={update('nome')} className={baseInput} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Telefone</label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={update('telefone')}
                    className={baseInput}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">E-mail *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  className={baseInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Assunto *</label>
                <select
                  required
                  value={form.assunto}
                  onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                  className={baseInput}
                >
                  <option value="">Selecione um assunto</option>
                  <option value="visita">Quero fazer uma visita</option>
                  <option value="pedido-oracao">Pedido de oração</option>
                  <option value="aconselhamento">Aconselhamento pastoral</option>
                  <option value="batismo">Quero ser batizado</option>
                  <option value="ministerio">Quero servir em um ministério</option>
                  <option value="duvidas">Dúvidas gerais</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem *</label>
                <textarea
                  required
                  value={form.mensagem}
                  onChange={update('mensagem')}
                  rows={5}
                  className={baseInput}
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-60 shadow-md hover:shadow-lg hover:shadow-primary/30"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar mensagem
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                Ao enviar, você concorda que suas informações sejam usadas apenas para contato da igreja.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
