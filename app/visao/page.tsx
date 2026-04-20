import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Eye, Compass, Heart, Users, BookOpen, Globe } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'

export const metadata: Metadata = {
  title: 'Nossa Visão | Primeira Igreja Batista de Capim Grosso',
  description: 'Conheça a visão, missão e propósitos da Primeira Igreja Batista de Capim Grosso.',
}

const propositos = [
  {
    icon: Heart,
    title: 'Adoração',
    description: 'Celebrar a presença de Deus com adoração genuína, reconhecendo Sua majestade e soberania.',
    verse: '"Adorai ao Senhor na beleza da santidade" - Salmo 96:9',
  },
  {
    icon: Users,
    title: 'Comunhão',
    description: 'Desenvolver relacionamentos autênticos e profundos entre os membros da família de Deus.',
    verse: '"Perseveravam na comunhão" - Atos 2:42',
  },
  {
    icon: BookOpen,
    title: 'Discipulado',
    description: 'Equipar cada pessoa para crescer em maturidade espiritual e conhecimento da Palavra.',
    verse: '"Fazei discípulos de todas as nações" - Mateus 28:19',
  },
  {
    icon: Globe,
    title: 'Evangelismo',
    description: 'Compartilhar as boas novas de Jesus Cristo com todos, em nossa cidade e além.',
    verse: '"Ide por todo o mundo e pregai o evangelho" - Marcos 16:15',
  },
]

const pilares = [
  {
    title: 'Palavra de Deus',
    description: 'A Bíblia é nosso fundamento. Cremos que toda Escritura é inspirada por Deus e útil para ensinar, repreender, corrigir e instruir na justiça.',
  },
  {
    title: 'Oração',
    description: 'A oração é nossa comunicação com Deus. Buscamos Sua face em tudo que fazemos, dependendo de Sua direção e poder.',
  },
  {
    title: 'Família',
    description: 'Valorizamos a família como instituição criada por Deus. Trabalhamos para fortalecer casamentos e famílias.',
  },
  {
    title: 'Serviço',
    description: 'Seguimos o exemplo de Jesus, que veio para servir. Cada membro é chamado a usar seus dons para edificação do corpo.',
  },
]

export default function VisaoPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80)' }}
        >
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-4">
            Nossa Visão
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            O que nos move e para onde caminhamos
          </p>
        </div>
      </section>

      {/* Missão e Visão */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Missão */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Nossa Missão
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Proclamar o Evangelho de Jesus Cristo, fazer discípulos comprometidos 
                com a Palavra de Deus e servir à comunidade com amor e compaixão, 
                refletindo o caráter de Cristo em todas as áreas da vida.
              </p>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, 
                e do Filho, e do Espírito Santo&rdquo; - Mateus 28:19
              </p>
            </div>

            {/* Visão */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Nossa Visão
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Ser uma igreja relevante que transforma vidas e impacta a sociedade 
                através do poder do Evangelho, formando discípulos que fazem discípulos 
                e alcançando pessoas para Cristo em nossa cidade, região e nações.
              </p>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;Ser-me-eis testemunhas tanto em Jerusalém como em toda a Judeia 
                e Samaria e até aos confins da terra&rdquo; - Atos 1:8
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Propósitos */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle 
            title="Nossos Propósitos" 
            subtitle="Os quatro pilares que sustentam nossa caminhada"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {propositos.map((proposito) => (
              <div
                key={proposito.title}
                className="bg-card rounded-lg p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <proposito.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{proposito.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{proposito.description}</p>
                <p className="text-xs text-primary italic">{proposito.verse}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionTitle 
                title="Nossos Pilares" 
                subtitle="Os fundamentos que nos sustentam"
                centered={false}
              />
              <div className="space-y-6">
                {pilares.map((pilar, index) => (
                  <div key={pilar.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{pilar.title}</h3>
                      <p className="text-sm text-muted-foreground">{pilar.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div 
              className="aspect-square rounded-lg bg-cover bg-center shadow-lg"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80)' }}
            />
          </div>
        </div>
      </section>

      {/* Versículo Central */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Compass className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif italic mb-4 text-balance">
            &ldquo;Confia no Senhor de todo o teu coração e não te estribes no teu próprio 
            entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.&rdquo;
          </blockquote>
          <cite className="text-lg opacity-90">Provérbios 3:5-6</cite>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
            Faça Parte Desta Visão
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Convidamos você a fazer parte desta comunidade de fé. Juntos, podemos fazer 
            a diferença em nossa cidade e no mundo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/ministerios"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Nossos Ministérios
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary/5 transition-colors"
            >
              Próximos Eventos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
