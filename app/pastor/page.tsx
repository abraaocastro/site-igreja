import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, Instagram, BookOpen, Heart, Users, GraduationCap, Quote, Church, ArrowRight } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { getChurch, formatPhone, telHref, mailtoHref } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Conheça o Pastor | Primeira Igreja Batista de Capim Grosso',
  description: 'Conheça o Pastor Presidente da Primeira Igreja Batista de Capim Grosso.',
}

const ministerio = [
  { icon: BookOpen, label: 'Pregação Expositiva', description: 'Ensino sistemático da Palavra de Deus' },
  { icon: Heart, label: 'Aconselhamento', description: 'Cuidado pastoral e orientação espiritual' },
  { icon: Users, label: 'Discipulado', description: 'Formação de novos líderes e discípulos' },
  { icon: GraduationCap, label: 'Ensino', description: 'Capacitação bíblica e teológica' },
]

export default function PastorPage() {
  const { pastor, contato } = getChurch()
  const pastorEmailLink = mailtoHref(contato.email)
  const pastorPhoneLink = telHref(contato.telefone)
  const pastorPhoneDisplay = formatPhone(contato.telefone)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-4">
                <Church className="h-4 w-4 text-accent" />
                {pastor.titulo}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
                Pr. {pastor.nome}
              </h1>
              <div className="text-lg opacity-90 max-w-xl leading-relaxed space-y-2">
                {pastor.bio.map((paragrafo, i) => (
                  <p key={i}>{paragrafo}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {pastorEmailLink && (
                  <a
                    href={pastorEmailLink}
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-md font-medium hover:bg-accent/90 transition"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar e-mail
                  </a>
                )}
                {pastor.instagram && (
                  <a
                    href={pastor.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-md font-medium transition"
                  >
                    <Instagram className="h-4 w-4" />
                    @prsilasbarreto
                  </a>
                )}
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-md font-medium transition"
                >
                  Agendar conversa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative mx-auto lg:ml-auto">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[22rem] md:h-[22rem]">
                <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl glow-cyan">
                  <Image
                    src={pastor.foto}
                    alt={`${pastor.titulo} ${pastor.nome}`}
                    fill
                    sizes="(min-width: 768px) 22rem, 80vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white text-primary px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
                  {pastor.titulo}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfil */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[360px_1fr] gap-10 items-start">
            <aside className="lg:sticky lg:top-24 self-start space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <Image
                    src={pastor.foto}
                    alt={`${pastor.titulo} ${pastor.nome}`}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground">Pr. {pastor.nome}</h2>
                <p className="text-sm text-primary font-medium">{pastor.titulo}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pastoreando a PIBAC
                </p>
                {(pastorEmailLink || pastorPhoneLink || pastor.instagram) && (
                  <div className="mt-5 pt-5 border-t border-border space-y-2">
                    {pastorEmailLink && (
                      <a
                        href={pastorEmailLink}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition break-all"
                      >
                        <Mail className="h-4 w-4 shrink-0" />
                        {contato.email}
                      </a>
                    )}
                    {pastorPhoneLink && (
                      <a
                        href={pastorPhoneLink}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
                      >
                        <Phone className="h-4 w-4 shrink-0" />
                        {pastorPhoneDisplay}
                      </a>
                    )}
                    {pastor.instagram && (
                      <a
                        href={pastor.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
                      >
                        <Instagram className="h-4 w-4 shrink-0" />
                        @prsilasbarreto
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-brand-gradient text-white rounded-2xl p-6 shadow-lg">
                <Quote className="h-7 w-7 text-accent mb-2" />
                <p className="italic font-serif">
                  &ldquo;Apascenta os meus cordeiros, cuida das minhas ovelhas.&rdquo;
                </p>
                <p className="mt-2 text-sm opacity-80">João 21:15-17</p>
              </div>
            </aside>

            <div>
              <SectionTitle title="Sobre o Pastor" centered={false} />
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {pastor.bio.map((paragrafo, i) => (
                  <p key={i}>{paragrafo}</p>
                ))}
                <p>
                  Como {pastor.titulo} da Primeira Igreja Batista de Capim Grosso, lidera
                  com paixão pelo Evangelho e amor pelas pessoas, dedicando-se ao ensino da
                  Palavra, ao aconselhamento pastoral e à formação de novos discípulos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Ministério */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Áreas de Ministério" subtitle="Principais frentes de atuação pastoral" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ministerio.map((item) => (
              <div
                key={item.label}
                className="bg-card rounded-xl p-6 border border-border text-center shadow-sm hover-lift"
              >
                <div className="w-14 h-14 bg-brand-gradient-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mensagem */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <Quote className="h-10 w-10 text-accent mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
              Mensagem do Pastor
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Queridos irmãos e amigos,</p>
              <p>
                É com grande alegria que dou as boas-vindas a todos que visitam nossa página.
                A Primeira Igreja Batista de Capim Grosso é uma comunidade de fé onde você
                encontrará acolhimento, amor e a oportunidade de crescer no conhecimento de Deus.
              </p>
              <p>
                Nossa igreja existe para glorificar a Deus através da adoração, do discipulado,
                da comunhão e do evangelismo. Cremos que a Bíblia é a Palavra de Deus e que
                Jesus Cristo é o único caminho para a salvação.
              </p>
              <p>
                Se você está buscando uma igreja onde possa crescer espiritualmente e servir
                ao Senhor, venha nos visitar. Será uma honra recebê-lo e caminhar ao seu lado
                nesta jornada de fé.
              </p>
              <p className="text-right italic pt-4 border-t border-border">
                Com amor em Cristo,
                <br />
                <strong className="text-foreground not-italic">Pr. {pastor.nome}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Agende uma conversa</h2>
          <p className="opacity-90 max-w-xl mx-auto mb-6">
            O Pastor está disponível para atendimento pastoral, aconselhamento e orientação espiritual.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-md font-semibold hover:bg-accent/90 transition"
          >
            <Phone className="h-4 w-4" />
            Entrar em Contato
          </Link>
        </div>
      </section>
    </div>
  )
}
