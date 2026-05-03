import Link from 'next/link'
import { ArrowUpRight, BookOpen, Heart, Users, Globe, Church, Cross } from 'lucide-react'

export const metadata = {
  title: 'Quem Somos',
  description: 'Conheça a Primeira Igreja Batista de Capim Grosso, nossa missão, valores e o que acreditamos.',
}

const valores = [
  { icon: BookOpen, title: 'Fidelidade à Palavra', description: 'Cremos na Bíblia como única regra de fé e prática, inspirada por Deus e inerrante em seu conteúdo original.' },
  { icon: Heart, title: 'Amor ao Próximo', description: 'Seguimos o exemplo de Cristo, amando e servindo as pessoas sem distinção, compartilhando o amor de Deus.' },
  { icon: Users, title: 'Comunhão Fraterna', description: 'Valorizamos relacionamentos autênticos, crescendo juntos como família de Deus em amor e unidade.' },
  { icon: Globe, title: 'Compromisso Missionário', description: 'Levamos o Evangelho além das fronteiras, alcançando vidas para Cristo em nossa cidade e no mundo.' },
  { icon: Cross, title: 'Adoração Genuína', description: 'Adoramos a Deus em espírito e em verdade, reconhecendo Sua soberania sobre todas as coisas.' },
  { icon: Church, title: 'Igreja Local', description: 'Cremos na igreja local como o corpo de Cristo, onde cada membro tem dons para edificação mútua.' },
]

const cremos = [
  'Na Trindade: um só Deus em três pessoas — Pai, Filho e Espírito Santo.',
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
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-3xl">
            <div className="eyebrow mb-5 inline-flex items-center gap-2.5">
              <span className="w-7 h-px bg-current opacity-50" /> Quem somos
            </div>
            <h1 className="display mb-6" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              Uma comunidade<br />de fé, <em className="text-brand-gradient">amor</em><br />e esperança.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[52ch]">
              A Primeira Igreja Batista de Capim Grosso é uma comunidade cristã evangélica,
              fundamentada na Palavra de Deus e comprometida com a proclamação do Evangelho de Jesus Cristo.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              <Link href="/historia" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Nossa história <ArrowUpRight className="h-4 w-4" /></Link>
              <Link href="/pastor" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Conheça o pastor</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="eyebrow mb-3.5">— Nossos valores</div>
          <h2 className="display mb-12" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>O que nos move.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {valores.map((v, i) => (
              <div key={v.title} className="card-soft rounded-[22px] p-7 hover:!transform-none">
                <div className="font-mono text-[11px] text-muted-foreground tracking-[.14em] mb-4">/{String(i + 1).padStart(2, '0')}</div>
                <v.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-serif text-xl tracking-tight mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que cremos */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20">
            <div>
              <div className="eyebrow mb-3.5">— Declaração de fé</div>
              <h2 className="display mb-6" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>O que cremos.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Somos parte da Convenção Batista Brasileira e cremos nos princípios históricos dos batistas:
                autoridade das Escrituras, sacerdócio universal, autonomia da igreja local e liberdade religiosa.
              </p>
            </div>
            <div className="space-y-4">
              {cremos.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-[16px] border border-border hover:border-foreground transition-colors">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-foreground text-background text-sm font-mono grid place-items-center">{i + 1}</span>
                  <p className="text-[15px] text-foreground leading-relaxed pt-1">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Missão / Visão / Propósito */}
      <section className="py-20 md:py-28 bg-brand-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 25% 35%, rgba(0,194,255,.15), transparent 60%)',
        }} />
        <div className="relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {[
              { n: '/01', t: 'Missão', d: 'Proclamar o Evangelho de Jesus Cristo, fazer discípulos comprometidos com a Palavra de Deus e servir à comunidade com amor e compaixão.' },
              { n: '/02', t: 'Visão', d: 'Ser uma igreja relevante que transforma vidas e impacta a sociedade através do poder do Evangelho, formando discípulos que fazem discípulos.' },
              { n: '/03', t: 'Propósito', d: 'Glorificar a Deus em tudo o que fazemos, amando-O de todo o coração e amando o próximo como a nós mesmos.' },
            ].map(item => (
              <div key={item.n}>
                <div className="font-mono text-[11px] tracking-[.14em] text-accent mb-4">{item.n}</div>
                <h3 className="font-serif text-[28px] leading-none tracking-tight mb-4">{item.t}</h3>
                <p className="text-white/75 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10 text-center">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Venha nos <em className="italic">conhecer.</em></h2>
          <p className="text-muted-foreground max-w-[46ch] mx-auto mb-8">
            Convidamos você a fazer parte desta comunidade de fé. Juntos, fazemos a diferença.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/ministerios" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Nossos ministérios <ArrowUpRight className="h-4 w-4" /></Link>
            <Link href="/eventos" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Próximos eventos</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
