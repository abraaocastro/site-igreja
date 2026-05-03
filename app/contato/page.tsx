'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Send, Loader2, MessageCircle, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  getChurch, formatAddressOneLine, formatPhone,
  whatsappHref, getMapsDirectionsUrl, type Church,
} from '@/lib/site-data'
import { getChurchEffective } from '@/lib/cms'
import { cn } from '@/lib/utils'

export default function ContatoPage() {
  const [church, setChurch] = useState<Church>(() => getChurch())
  useEffect(() => { let c = false; getChurchEffective().then(v => { if (!c) setChurch(v) }); return () => { c = true } }, [])

  const { endereco, contato, social } = church
  const hasWhatsapp = Boolean(contato.whatsapp)
  const whatsappDisplay = formatPhone(contato.whatsapp)
  const mapsUrl = getMapsDirectionsUrl()

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.email || !form.assunto || !form.mensagem) { toast.error('Preencha todos os campos obrigatórios.'); return }
    setSending(true)
    try {
      const res = await fetch('/api/contato', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erro ao enviar.'); return }
      setSent(true); toast.success('Mensagem enviada!'); setForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })
    } catch { toast.error('Erro de conexão.') } finally { setSending(false) }
  }

  const sendViaWhatsapp = () => {
    const labels: Record<string, string> = { visita: 'Quero visitar', 'pedido-oracao': 'Pedido de oração', aconselhamento: 'Aconselhamento', batismo: 'Batismo', ministerio: 'Servir em ministério', duvidas: 'Dúvidas', outros: 'Outros' }
    const lines = [`*Site ${church.nomeCurto}*`, '', `*Nome:* ${form.nome}`, form.email ? `*E-mail:* ${form.email}` : '', `*Assunto:* ${labels[form.assunto] || form.assunto}`, '', form.mensagem].filter(Boolean).join('\n')
    const url = whatsappHref(contato.whatsapp, lines)
    if (url) window.open(url, '_blank')
  }

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value })
  const inp = 'w-full h-11 px-4 rounded-full border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-3xl">
            <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Contato</div>
            <h1 className="display mb-5" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              Fale <em className="text-brand-gradient">conosco.</em>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[52ch]">
              Tem dúvidas, quer fazer uma visita ou precisa de oração? Estamos aqui para você.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-8 lg:gap-14">
            {/* Form */}
            <div className="card-soft rounded-[22px] p-7 md:p-10 hover:!transform-none">
              {sent ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/15 grid place-items-center mx-auto"><Send className="h-7 w-7 text-accent" /></div>
                  <h2 className="font-serif text-2xl tracking-tight">Mensagem recebida!</h2>
                  <p className="text-muted-foreground text-sm">Entraremos em contato em breve.</p>
                  <button onClick={() => setSent(false)} className="text-primary text-sm hover:underline">Enviar outra</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <h2 className="font-serif text-2xl tracking-tight mb-2">Envie sua mensagem</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Seu nome *" value={form.nome} onChange={update('nome')} required className={inp} />
                    <input type="email" placeholder="Seu e-mail *" value={form.email} onChange={update('email')} required className={inp} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input type="tel" placeholder="Telefone (opcional)" value={form.telefone} onChange={update('telefone')} className={inp} />
                    <select value={form.assunto} onChange={update('assunto')} required className={cn(inp, !form.assunto && 'text-muted-foreground')}>
                      <option value="">Assunto *</option>
                      <option value="visita">Quero fazer uma visita</option>
                      <option value="pedido-oracao">Pedido de oração</option>
                      <option value="aconselhamento">Aconselhamento pastoral</option>
                      <option value="batismo">Quero ser batizado</option>
                      <option value="ministerio">Servir em um ministério</option>
                      <option value="duvidas">Dúvidas gerais</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                  <textarea placeholder="Sua mensagem *" value={form.mensagem} onChange={update('mensagem')} required rows={5}
                    className="w-full px-4 py-3 rounded-[16px] border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button type="submit" disabled={sending} className="btn btn-primary h-[46px] px-6 rounded-full text-[15px] flex-1 justify-center">
                      {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : <><Send className="h-4 w-4" /> Enviar mensagem</>}
                    </button>
                    {hasWhatsapp && form.nome && form.assunto && form.mensagem && (
                      <button type="button" onClick={sendViaWhatsapp} className="h-[46px] px-6 rounded-full text-[15px] font-medium inline-flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 transition flex-1">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">Suas informações serão usadas apenas para contato da igreja.</p>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              <div className="card-soft rounded-[22px] p-7 hover:!transform-none space-y-4">
                <h3 className="font-serif text-xl tracking-tight">Informações</h3>
                <div className="space-y-3.5">
                  {[
                    { icon: <MapPin className="h-4 w-4" />, label: 'Endereço', value: formatAddressOneLine(endereco), href: mapsUrl },
                    { icon: <Clock className="h-4 w-4" />, label: 'Cultos', value: 'Dom 9h e 19h · Qua 19h30' },
                    ...(hasWhatsapp ? [{ icon: <MessageCircle className="h-4 w-4" />, label: 'WhatsApp', value: whatsappDisplay || '', href: whatsappHref(contato.whatsapp, 'Olá!') || undefined }] : []),
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-surface-2 grid place-items-center shrink-0 mt-0.5">{r.icon}</div>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">{r.label}</div>
                        {r.href ? (
                          <a href={r.href} target="_blank" rel="noreferrer" className="text-sm text-foreground hover:text-primary transition break-words">{r.value}</a>
                        ) : (
                          <div className="text-sm">{r.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Redes */}
              <div className="card-soft rounded-[22px] p-7 hover:!transform-none">
                <h3 className="font-serif text-xl tracking-tight mb-4">Redes sociais</h3>
                <div className="flex flex-wrap gap-2.5">
                  {social.instagram && (
                    <a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="btn btn-ghost h-10 px-4 rounded-full text-sm">Instagram</a>
                  )}
                  {social.youtube && (
                    <a href={social.youtube} target="_blank" rel="noreferrer" className="btn btn-ghost h-10 px-4 rounded-full text-sm">YouTube</a>
                  )}
                </div>
              </div>

              {/* Map */}
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="block rounded-[22px] overflow-hidden border border-border hover:border-foreground transition-colors" style={{ minHeight: 200 }}>
                <div className="w-full h-[200px] relative" style={{
                  background: 'linear-gradient(160deg, rgba(10,41,115,.5), rgba(2,11,33,.2) 70%), repeating-linear-gradient(135deg, var(--surface-3) 0 24px, var(--surface-2) 24px 48px)',
                }}>
                  <span className="absolute top-4 left-4 inline-flex items-center gap-2 h-8 px-3.5 bg-background/95 border border-border rounded-full text-xs font-medium">
                    <MapPin className="h-3 w-3" /> Ver no mapa <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
