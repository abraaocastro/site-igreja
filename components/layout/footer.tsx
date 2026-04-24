import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Heart, Navigation, MessageCircle, ArrowUpRight,
} from 'lucide-react'
import {
  getChurch, formatAddressOneLine, formatPhone, telHref, mailtoHref, whatsappHref, getMapsDirectionsUrl,
} from '@/lib/site-data'

const footerLinks = {
  igreja: [
    { name: 'Quem Somos', href: '/quem-somos' },
    { name: 'Nossa História', href: '/historia' },
    { name: 'Nossa Visão', href: '/visao' },
    { name: 'Conheça o Pastor', href: '/pastor' },
  ],
  programacao: [
    { name: 'Ministérios', href: '/ministerios' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Calendário', href: '/calendario' },
    { name: 'Plano de Leitura', href: '/plano-leitura' },
  ],
  participar: [
    { name: 'Contribua', href: '/contribua' },
    { name: 'Fale Conosco', href: '/contato' },
    { name: 'Área Restrita', href: '/login' },
  ],
}

export function Footer() {
  const church = getChurch()
  const { endereco, contato, social } = church
  const phoneDisplay = formatPhone(contato.telefone)
  const phoneLink = telHref(contato.telefone)
  const emailLink = mailtoHref(contato.email)
  const whatsappLink = whatsappHref(contato.whatsapp)
  const whatsappDisplay = formatPhone(contato.whatsapp)
  const mapsDirectionsUrl = getMapsDirectionsUrl()

  return (
    <footer className="bg-[#07091A] text-white relative overflow-hidden">
      {/* Big wordmark */}
      <div className="pointer-events-none absolute -bottom-16 md:-bottom-24 left-0 right-0 text-center select-none opacity-[0.06]">
        <span className="display text-[22vw] leading-none font-semibold whitespace-nowrap">
          Canaã
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Top CTA */}
        <div className="mb-12 md:mb-16 grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <div className="eyebrow text-accent mb-3">Venha nos visitar</div>
            <h3 className="display text-4xl md:text-5xl lg:text-6xl text-white text-balance max-w-2xl">
              Há um assento esperando por você.
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contato" className="btn-primary bg-white text-[#07091A] hover:bg-accent">
              Fale com a igreja <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a href={mapsDirectionsUrl} target="_blank" rel="noreferrer"
               className="btn-ghost border-white/25 text-white hover:bg-white/10 hover:border-white">
              Como chegar <Navigation className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 bg-white rounded-xl p-1.5 shrink-0">
                <Image src="/logo.png" alt="PIBAC" fill sizes="48px" className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Primeira Igreja Batista</p>
                <p className="text-xs opacity-70 uppercase tracking-wider">Capim Grosso · Bahia</p>
              </div>
            </div>
            <p className="text-sm opacity-75 mb-6 leading-relaxed max-w-sm">
              Uma comunidade de fé, amor e esperança — desde 1978, servindo a região do piemonte.
            </p>
            <div className="flex flex-wrap gap-2">
              <SocialLink href={social.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialLink>
              <SocialLink href={social.instagramJovens} label="Rede de Jovens">RDJ</SocialLink>
              <SocialLink href={social.instagramPastor} label="Pastor">PR</SocialLink>
              {social.facebook && <SocialLink href={social.facebook} label="Facebook"><Facebook className="h-4 w-4" /></SocialLink>}
              {social.youtube && <SocialLink href={social.youtube} label="YouTube"><Youtube className="h-4 w-4" /></SocialLink>}
            </div>
          </div>

          {/* Link columns */}
          <FooterCol title="A Igreja" links={footerLinks.igreja} />
          <FooterCol title="Programação" links={footerLinks.programacao} />
          <FooterCol title="Participe" links={footerLinks.participar} />

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-accent mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={mapsDirectionsUrl} target="_blank" rel="noreferrer"
                  className="flex items-start gap-2 opacity-85 hover:opacity-100 hover:text-accent transition">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                  <span>{formatAddressOneLine(endereco)}, CEP {endereco.cep}</span>
                </a>
              </li>
              {phoneLink && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  <a href={phoneLink} className="opacity-85 hover:opacity-100 hover:text-accent">{phoneDisplay}</a>
                </li>
              )}
              {whatsappLink && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="opacity-85 hover:opacity-100 hover:text-accent">
                    {whatsappDisplay} <span className="opacity-60">(WhatsApp)</span>
                  </a>
                </li>
              )}
              {emailLink && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <a href={emailLink} className="opacity-85 hover:opacity-100 hover:text-accent break-all">{contato.email}</a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <div className="opacity-85">
                  <p>Domingo · 9h e 19h</p>
                  <p>Quarta · 19h30</p>
                  <p>Sábado · 19h30 (Jovens)</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} Primeira Igreja Batista de Capim Grosso. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-60 flex items-center gap-1.5">
            Feito com <Heart className="h-3 w-3 fill-accent text-accent" /> para a obra do Senhor
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div className="lg:col-span-2">
      <h4 className="text-[11px] font-mono uppercase tracking-wider text-accent mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.name}>
            <Link href={l.href} className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition inline-block">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLink({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}
       className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition text-xs font-semibold">
      {children}
    </a>
  )
}
