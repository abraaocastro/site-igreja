'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  BookOpen,
  Heart,
  Users,
  Globe,
  Sparkles,
  ChevronRight,
  Church,
  HandHeart,
} from 'lucide-react'
import { BannerCarousel } from '@/components/banner-carousel'
import { SectionTitle } from '@/components/section-title'
import {
  heroBanners as defaultHero,
  inlineBanners,
  ministerios as defaultMinisterios,
  eventos as defaultEventos,
  horariosCultos,
} from '@/lib/data'
import { getChurch, formatAddressOneLine } from '@/lib/site-data'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function loadCms<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('pibac-cms-' + key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

export default function Home() {
  const church = getChurch()
  const [heroBanners, setHeroBanners] = useState(defaultHero)
  const [ministerios, setMinisterios] = useState(defaultMinisterios)
  const [eventos, setEventos] = useState(defaultEventos)
  const [textos, setTextos] = useState({
    homeTitulo: 'Bem-vindo à Nossa Igreja',
    homeSubtitulo: 'Somos uma comunidade de fé comprometida em amar a Deus e ao próximo',
    versiculoDestaque:
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    versiculoReferencia: 'João 3:16',
  })

  useEffect(() => {
    setHeroBanners(loadCms('banners', defaultHero))
    setMinisterios(loadCms('ministerios', defaultMinisterios))
    setEventos(loadCms('eventos', defaultEventos))
    setTextos(loadCms('textos', textos))

  }, [])

  const proximosEventos = [...eventos]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
    .slice(0, 3)
  const ministeriosDestaque = ministerios.slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <BannerCarousel banners={heroBanners} variant="hero" />

      {/* Horários dos Cultos */}
      <section className="bg-brand-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 h-40 w-40 bg-accent rounded-full blur-2xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <span className="hidden md:flex items-center gap-1.5 text-accent font-semibold uppercase tracking-wider text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Nossos cultos
            </span>
            {horariosCultos.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="font-semibold">{c.dia}</span>
                <span className="opacity-80">
                  {c.horario} · {c.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boas-vindas */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <Church className="h-3.5 w-3.5" />
                PIB Capim Grosso
              </div>
              <SectionTitle
                title={textos.homeTitulo}
                subtitle={textos.homeSubtitulo}
                centered={false}
              />
              <p className="text-muted-foreground mb-4 leading-relaxed">
                A Primeira Igreja Batista de Capim Grosso é um lugar onde você pode encontrar
                paz, comunhão e crescimento espiritual. Aqui, todas as pessoas são bem-vindas,
                independentemente de sua história.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Nossa missão é proclamar o Evangelho de Jesus Cristo, fazer discípulos e
                transformar vidas através do amor e da graça de Deus.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/quem-somos"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition shadow-md hover:shadow-lg hover:shadow-primary/30"
                >
                  Conheça-nos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/visao"
                  className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary hover:text-primary-foreground transition"
                >
                  Nossa Visão
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -right-6 h-32 w-32 bg-accent/20 rounded-full blur-2xl" />
              <div className="grid grid-cols-2 gap-4 relative">
                {[
                  { icon: Heart, title: 'Amor', text: 'Compartilhando o amor de Cristo', gradient: true },
                  { icon: Users, title: 'Comunhão', text: 'Crescendo juntos em família' },
                  { icon: BookOpen, title: 'Palavra', text: 'Fundamentados na Bíblia' },
                  { icon: Globe, title: 'Missões', text: 'Alcançando vidas para Cristo' },
                ].map((f, i) => (
                  <div
                    key={f.title}
                    className={`group bg-card rounded-xl p-5 border border-border text-center hover-lift ${
                      i === 0 ? 'bg-brand-gradient text-white border-0' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        i === 0 ? 'bg-white/20' : 'bg-accent/15'
                      }`}
                    >
                      <f.icon className={`h-6 w-6 ${i === 0 ? 'text-accent' : 'text-primary'}`} />
                    </div>
                    <h3 className={`font-semibold mb-1 ${i === 0 ? 'text-white' : 'text-foreground'}`}>
                      {f.title}
                    </h3>
                    <p
                      className={`text-xs ${i === 0 ? 'text-white/80' : 'text-muted-foreground'}`}
                    >
                      {f.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pastor destaque */}
      <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 30%, #00C2FF 0%, transparent 50%), radial-gradient(circle at 70% 70%, #0A2973 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-center">
            <div className="relative mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl -z-10 scale-90" />
              <div className="relative w-72 h-72 md:w-[22rem] md:h-[22rem] rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <Image
                  src="/pastor-silas.png"
                  alt="Pr. Silas"
                  fill
                  sizes="(min-width: 768px) 22rem, 18rem"
                  className="object-cover"
                />
              </div>
              <div className="absolute top-4 -left-4 bg-brand-gradient text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
                Pastor Presidente
              </div>
            </div>
            <div>
              <SectionTitle
                title="Pr. Silas"
                subtitle="Liderando com fé, servindo com amor"
                centered={false}
              />
              <p className="text-muted-foreground leading-relaxed mb-4">
                Sob a liderança do Pastor Silas, a PIBAC tem vivido um tempo de crescimento
                espiritual, fortalecimento das famílias e avanço missionário na nossa região.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Ele dedica sua vida à pregação fiel da Palavra, ao cuidado pastoral e à
                formação de novos discípulos para a glória de Deus.
              </p>
              <Link
                href="/pastor"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition shadow-md hover:shadow-lg hover:shadow-primary/30"
              >
                Conhecer o Pastor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Inline */}
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BannerCarousel banners={inlineBanners} variant="inline" autoplayDelay={4000} />
        </div>
      </section>

      {/* Ministérios */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Nossos Ministérios"
            subtitle="Diversas formas de servir e crescer em comunidade"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ministeriosDestaque.map((m) => (
              <Link
                key={m.id}
                href={`/ministerios#${m.id}`}
                className="group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover-lift"
              >
                <div className="relative h-44">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${m.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-serif font-bold text-white">{m.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Saber mais
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/ministerios"
              className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              Ver todos os ministérios
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Próximos Eventos" subtitle="Participe das nossas atividades e cresça conosco" />
          {proximosEventos.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum evento agendado no momento.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {proximosEventos.map((e) => (
                <article
                  key={e.id}
                  className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover-lift"
                >
                  <div className="relative h-48">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${e.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-white text-primary shadow-md">
                      <span className="text-lg font-bold leading-none">
                        {format(parseISO(e.date), 'dd')}
                      </span>
                      <span className="text-[10px] uppercase font-semibold mt-0.5">
                        {format(parseISO(e.date), 'MMM', { locale: ptBR }).replace('.', '')}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg text-foreground mb-2">{e.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{e.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {e.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {e.location}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition shadow-md"
            >
              Ver todos os eventos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/calendario"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary hover:text-primary-foreground transition"
            >
              <Calendar className="h-4 w-4" />
              Calendário interativo
            </Link>
          </div>
        </div>
      </section>

      {/* Contribua + Plano */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <Link
            href="/plano-leitura"
            className="group relative overflow-hidden rounded-2xl p-8 md:p-10 bg-brand-gradient text-white hover:shadow-2xl transition-shadow"
          >
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-accent/40 rounded-full blur-3xl" />
            <BookOpen className="h-10 w-10 text-accent mb-3" />
            <h3 className="text-2xl font-serif font-bold mb-2">Plano de Leitura Bíblica</h3>
            <p className="opacity-90 mb-5">30 dias para mergulhar na Palavra conosco.</p>
            <span className="inline-flex items-center gap-1 font-medium text-accent group-hover:gap-2 transition-all">
              Começar agora <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/contribua"
            className="group relative overflow-hidden rounded-2xl p-8 md:p-10 bg-card border border-border hover-lift"
          >
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-accent/15 rounded-full blur-3xl" />
            <HandHeart className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-2xl font-serif font-bold mb-2 text-foreground">Contribua com a Obra</h3>
            <p className="text-muted-foreground mb-5">
              Dízimos, ofertas e missões — cada semente transforma vidas.
            </p>
            <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:gap-2 transition-all">
              Saiba mais <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Versículo */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 h-64 w-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative h-16 w-16 mx-auto mb-6 opacity-90">
            <Image src="/logo.png" alt="" fill sizes="64px" className="object-contain" />
          </div>
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif italic mb-4 text-balance">
            &ldquo;{textos.versiculoDestaque}&rdquo;
          </blockquote>
          <cite className="text-lg text-accent font-semibold">{textos.versiculoReferencia}</cite>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div
                className="h-64 lg:h-auto bg-cover bg-center relative"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80)',
                }}
              >
                <div className="absolute inset-0 bg-brand-gradient opacity-30" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                  Venha nos Visitar
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Será um prazer recebê-lo em nossa igreja. Temos um lugar especial
                  esperando por você e sua família. Venha fazer parte da nossa comunidade!
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{formatAddressOneLine(church.endereco)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">Domingos às 9h e 19h</span>
                  </div>
                </div>
                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition w-fit shadow-md hover:shadow-lg hover:shadow-primary/30"
                >
                  Entre em Contato
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
