import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Heart, BookOpen, Users, Globe, Church, Cross } from 'lucide-react'
import { SectionTitle } from '@/components/section-title'
import { BannerCarousel } from '@/components/banner-carousel'

export const metadata: Metadata = {
  title: 'Quem Somos | Primeira Igreja Batista de Capim Grosso',
  description: 'Conheça a Primeira Igreja Batista de Capim Grosso, nossa missão, valores e o que acreditamos.',
}

const valores = [
  {
    icon: BookOpen,
    title: 'Fidelidade à Palavra',
    description: 'Cremos na Bíblia como única regra de fé e prática, inspirada por Deus e inerrante em seu conteúdo original.',
  },
  {
    icon: Heart,
    title: 'Amor ao Próximo',
    description: 'Seguimos o exemplo de Cristo, amando e servindo as pessoas sem distinção, compartilhando o amor de Deus.',
  },
  {
    icon: Users,
    title: 'Comunhão Fraterna',
    description: 'Valorizamos os relacionamentos autênticos, crescendo juntos como família de Deus em amor e unidade.',
  },
  {
    icon: Globe,
    title: 'Compromisso Missionário',
    description: 'Levamos o Evangelho além fronteiras, alcançando vidas para Cristo em nossa cidade e no mundo.',
  },
  {
    icon: Cross,
    title: 'Adoração Genuína',
    description: 'Adoramos a Deus em espírito e em verdade, reconhecendo Sua soberania sobre todas as coisas.',
  },
  {
    icon: Church,
    title: 'Igreja Local',
    description: 'Cremos na igreja local como o corpo de Cristo, onde cada membro tem dons para edificação mútua.',
  },
]

const cremos = [
  'Na Trindade: um só Deus em três pessoas - Pai, Filho e Espírito Santo.',
  'Na divindade de Jesus Cristo, seu nascimento virginal, vida sem pecado, morte expiatória, ressurreição corporal e segunda vinda.',
  'Na salvação pela graça mediante a fé em Jesus Cristo, não por obras.',
  'No batismo por imersão como testemunho público da fé em Cristo.',
  'Na Ceia do Senhor como memorial do sacrifício de Cristo.',
  'Na vida eterna para os salvos e na separação eterna de Deus para os perdidos.',
  'Na Grande Comissão como mandamento para todos os cristãos.',
]

export default function QuemSomosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80)' }}
        >
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-4">
            Quem Somos
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Uma comunidade de fé comprometida em amar a Deus e ao próximo
          </p>
        </div>
      </section>

      {/* Introdução */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionTitle 
                title="Nossa Igreja" 
                subtitle="Mais de 50 anos servindo a Deus em Capim Grosso"
                centered={false}
              />
              <div className="space-y-4 text-muted-foreground">
                <p>
                  A Primeira Igreja Batista de Capim Grosso é uma comunidade cristã evangélica, 
                  fundamentada na Palavra de Deus e comprometida com a proclamação do Evangelho 
                  de Jesus Cristo.
                </p>
                <p>
                  Somos parte da Convenção Batista Brasileira e cremos nos princípios históricos 
                  dos batistas: a autoridade das Escrituras, o sacerdócio universal dos crentes, 
                  a autonomia da igreja local, a liberdade religiosa e a separação entre igreja e estado.
                </p>
                <p>
                  Nossa igreja é um lugar de acolhimento, onde pessoas de todas as idades e 
                  backgrounds encontram amor, aceitação e oportunidade de crescimento espiritual.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/historia"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  Nossa História
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pastor"
                  className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary/5 transition-colors"
                >
                  Conheça o Pastor
                </Link>
              </div>
            </div>
            <div className="relative">
              <div 
                className="aspect-[4/3] rounded-lg bg-cover bg-center shadow-lg"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80)' }}
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-lg shadow-lg">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm">Anos de história</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle 
            title="Nossos Valores" 
            subtitle="Os princípios que norteiam nossa caminhada de fé"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valores.map((valor) => (
              <div
                key={valor.title}
                className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <valor.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{valor.title}</h3>
                <p className="text-sm text-muted-foreground">{valor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O Que Cremos */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <SectionTitle 
                title="O Que Cremos" 
                subtitle="Nossa declaração de fé"
                centered={false}
              />
              <ul className="space-y-4">
                {cremos.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div 
              className="aspect-square lg:aspect-auto rounded-lg bg-cover bg-center"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80)' }}
            />
          </div>
        </div>
      </section>

      {/* Missão, Visão, Propósito */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold mb-4">Missão</h3>
              <p className="opacity-90">
                Proclamar o Evangelho de Jesus Cristo, fazer discípulos e servir à comunidade 
                com amor e compaixão.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold mb-4">Visão</h3>
              <p className="opacity-90">
                Ser uma igreja relevante que transforma vidas e impacta a sociedade através 
                do poder do Evangelho.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold mb-4">Propósito</h3>
              <p className="opacity-90">
                Glorificar a Deus em tudo o que fazemos, amando-O de todo o coração e amando 
                o próximo como a nós mesmos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-8 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BannerCarousel 
            banners={[
              {
                id: '1',
                title: 'Venha nos Visitar',
                subtitle: 'Domingos às 9h e 19h - Quartas às 19h30',
                imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80',
                link: '/contato',
                buttonText: 'Como Chegar',
              },
            ]} 
            variant="inline" 
          />
        </div>
      </section>
    </div>
  )
}
