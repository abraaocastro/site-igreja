import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Heart, Navigation, MessageCircle } from 'lucide-react'
import {
  getChurch,
  formatAddressOneLine,
  formatPhone,
  telHref,
  mailtoHref,
  whatsappHref,
  getMapsDirectionsUrl,
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
  const hasEmail = !!emailLink
  const hasPhone = !!phoneLink
  const hasWhatsapp = !!whatsappLink
  const mapsDirectionsUrl = getMapsDirectionsUrl()

  return (
    <footer className="bg-brand-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #00C2FF 0%, transparent 40%), radial-gradient(circle at 80% 70%, #00C2FF 0%, transparent 40%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo e Informações */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-14 w-14 bg-white rounded-full p-1.5 shrink-0">
                <Image src="/logo.png" alt="PIBAC" fill sizes="56px" className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Primeira Igreja Batista</p>
                <p className="text-xs opacity-80 uppercase tracking-wider">Capim Grosso</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mb-5 leading-relaxed">
              Uma comunidade de fé, amor e esperança. Venha fazer parte da nossa família!
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                aria-label="Instagram da Igreja (@pibaccapimgrosso)"
                title="Instagram da Igreja"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={social.instagramJovens}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Instagram da Rede de Jovens (@rdjmbc)"
                title="Instagram dos Jovens"
              >
                RDJ
              </a>
              <a
                href={social.instagramPastor}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Instagram do Pr. Silas Barreto (@prsilasbarreto)"
                title="Instagram do Pastor"
              >
                PR
              </a>
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links da Igreja */}
          <div>
            <h3 className="font-semibold mb-4 text-accent">A Igreja</h3>
            <ul className="space-y-2.5">
              {footerLinks.igreja.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-90 hover:opacity-100 hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-accent transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programação */}
          <div>
            <h3 className="font-semibold mb-4 text-accent">Programação</h3>
            <ul className="space-y-2.5">
              {footerLinks.programacao.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-90 hover:opacity-100 hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-accent transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-semibold mt-6 mb-4 text-accent">Participe</h3>
            <ul className="space-y-2.5">
              {footerLinks.participar.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-90 hover:opacity-100 hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-accent transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4 text-accent">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2 -mx-1 px-1 py-1 rounded hover:bg-white/5 transition"
                  aria-label="Abrir rotas no Google Maps"
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                  <span className="opacity-90 group-hover:opacity-100">
                    {formatAddressOneLine(endereco)}, CEP {endereco.cep}
                    <span className="block text-xs mt-0.5 text-accent inline-flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      Como chegar
                    </span>
                  </span>
                </a>
              </li>
              {hasPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  <a href={phoneLink!} className="opacity-90 hover:opacity-100 hover:text-accent transition">
                    {phoneDisplay}
                  </a>
                </li>
              )}
              {hasWhatsapp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
                  <a
                    href={whatsappLink!}
                    target="_blank"
                    rel="noreferrer"
                    className="opacity-90 hover:opacity-100 hover:text-accent transition"
                    aria-label="Falar no WhatsApp"
                  >
                    {whatsappDisplay} <span className="opacity-70">(WhatsApp)</span>
                  </a>
                </li>
              )}
              {hasEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <a href={emailLink!} className="opacity-90 hover:opacity-100 hover:text-accent transition break-all">
                    {contato.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <div className="opacity-90">
                  <p>Domingo: 9h e 19h</p>
                  <p>Quarta: 19h30</p>
                  <p>Sábado: 19h30 (Jovens)</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-2 text-center">
          <p className="text-sm opacity-80">
            &copy; {new Date().getFullYear()} Primeira Igreja Batista de Capim Grosso. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-70 flex items-center gap-1">
            Feito com <Heart className="h-3 w-3 fill-destructive text-destructive" /> para a obra do Senhor
          </p>
        </div>
      </div>
    </footer>
  )
}
