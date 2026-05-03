import Link from 'next/link'
import { ArrowUpRight, Heart, Users, BookOpen, Globe } from 'lucide-react'

export const metadata = {
  title: 'Nossa Visão',
  description: 'Conheça a visão, missão e propósitos da Primeira Igreja Batista de Capim Grosso.',
}

const propositos = [
  { icon: Heart, n: '/01', title: 'Adoração', description: 'Celebrar a presença de Deus com adoração genuína, reconhecendo Sua majestade e soberania.', verse: 'Salmo 96:9' },
  { icon: Users, n: '/02', title: 'Comunhão', description: 'Desenvolver relacionamentos autênticos e profundos entre os membros da família de Deus.', verse: 'Atos 2:42' },
  { icon: BookOpen, n: '/03', title: 'Discipulado', description: 'Equipar cada pessoa para crescer em maturidade espiritual e conhecimento da Palavra.', verse: 'Mateus 28:19' },
  { icon: Globe, n: '/04', title: 'Evangelismo', description: 'Compartilhar as boas novas de Jesus Cristo com todos, em nossa cidade e além.', verse: 'Marcos 16:15' },
]

const pilares = [
  { title: 'Palavra de Deus', description: 'A Bíblia é nosso fundamento. Toda Escritura é inspirada por Deus e útil para ensinar, repreender, corrigir e instruir na justiça.' },
  { title: 'Oração', description: 'A oração é nossa comunicação com Deus. Buscamos Sua face em tudo que fazemos, dependendo de Sua direção e poder.' },
  { title: 'Família', description: 'Valorizamos a família como instituição criada por Deus. Trabalhamos para fortalecer casamentos e famílias.' },
  { title: 'Serviço', description: 'Seguimos o exemplo de Jesus, que veio para servir. Cada membro é chamado a usar seus dons para edificação do corpo.' },
]

export default function VisaoPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-3xl">
            <div className="eyebrow mb-5 inline-flex items-center gap-2.5"><span className="w-7 h-px bg-current opacity-50" /> Nossa visão</div>
            <h1 className="display mb-6" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              O que nos move<br />e para onde<br /><em className="text-brand-gradient">caminhamos.</em>
            </h1>
          </div>
        </div>
      </section>

      {/* Missão & Visão */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10 grid md:grid-cols-2 gap-[18px] md:gap-[22px]">
          <div className="card-soft rounded-[22px] p-8 md:p-10 hover:!transform-none">
            <div className="font-mono text-[11px] text-accent tracking-[.14em] mb-4">/01</div>
            <h2 className="font-serif text-[28px] md:text-[32px] leading-none tracking-tight mb-4">Nossa Missão</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Proclamar o Evangelho de Jesus Cristo, fazer discípulos comprometidos
              com a Palavra de Deus e servir à comunidade com amor e compaixão,
              refletindo o caráter de Cristo em todas as áreas da vida.
            </p>
            <p className="text-sm text-muted-foreground italic">&ldquo;Ide, ensinai todas as nações&rdquo; — Mateus 28:19</p>
          </div>
          <div className="card-soft rounded-[22px] p-8 md:p-10 hover:!transform-none">
            <div className="font-mono text-[11px] text-accent tracking-[.14em] mb-4">/02</div>
            <h2 className="font-serif text-[28px] md:text-[32px] leading-none tracking-tight mb-4">Nossa Visão</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Ser uma igreja relevante que transforma vidas e impacta a sociedade
              através do poder do Evangelho, formando discípulos que fazem discípulos
              e alcançando pessoas para Cristo.
            </p>
            <p className="text-sm text-muted-foreground italic">&ldquo;Ser-me-eis testemunhas&rdquo; — Atos 1:8</p>
          </div>
        </div>
      </section>

      {/* Propósitos */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="eyebrow mb-3.5">— Nossos propósitos</div>
          <h2 className="display mb-12" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Quatro pilares.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {propositos.map(p => (
              <div key={p.n} className="card-soft rounded-[22px] p-7 hover:!transform-none">
                <div className="font-mono text-[11px] text-muted-foreground tracking-[.14em] mb-4">{p.n}</div>
                <p.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-serif text-xl tracking-tight mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.description}</p>
                <p className="text-xs text-accent font-mono tracking-wider">{p.verse}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-20 md:py-28 bg-surface-2 border-y border-border">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3.5">— Fundamentos</div>
            <h2 className="display mb-4" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>O que nos sustenta.</h2>
          </div>
          <div className="space-y-4">
            {pilares.map((p, i) => (
              <div key={p.title} className="flex items-start gap-5 p-5 rounded-[18px] border border-border bg-surface hover:border-foreground transition-colors">
                <span className="shrink-0 w-10 h-10 rounded-full bg-foreground text-background font-mono text-sm grid place-items-center">{i + 1}</span>
                <div>
                  <h3 className="font-serif text-lg tracking-tight mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Versículo */}
      <section className="py-24 md:py-32 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,194,255,.12), transparent 60%)',
        }} />
        <div className="relative z-10 max-w-[800px] mx-auto px-6">
          <blockquote className="font-serif italic leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(24px, 4vw, 52px)' }}>
            &ldquo;Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.&rdquo;
          </blockquote>
          <cite className="mt-6 inline-block font-mono text-[12px] tracking-[.18em] text-accent uppercase not-italic">— Provérbios 3:5-6</cite>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
          <h2 className="display mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Faça parte desta <em className="italic">visão.</em></h2>
          <p className="text-muted-foreground max-w-[46ch] mx-auto mb-8">Convidamos você a fazer parte desta comunidade de fé. Juntos, fazemos a diferença.</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/ministerios" className="btn btn-primary h-[46px] px-5 rounded-full text-[15px]">Nossos ministérios <ArrowUpRight className="h-4 w-4" /></Link>
            <Link href="/eventos" className="btn btn-ghost h-[46px] px-5 rounded-full text-[15px]">Próximos eventos</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
