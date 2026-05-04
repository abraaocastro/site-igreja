'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Navigation } from 'lucide-react'
import {
  getChurch, formatAddressOneLine, formatPhone, whatsappHref, getMapsDirectionsUrl,
  type Church,
} from '@/lib/site-data'
import { getChurchEffective } from '@/lib/cms'

export function Footer() {
  const [church, setChurch] = useState<Church>(() => getChurch())
  useEffect(() => { getChurchEffective().then(setChurch) }, [])

  const { social } = church
  const mapsUrl = getMapsDirectionsUrl()

  return (
    <footer className="relative overflow-hidden bg-brand-navy text-white">
      {/* Wordmark gigante */}
      <div className="pointer-events-none absolute bottom-[-40px] left-[-20px] select-none font-serif italic leading-[0.85] tracking-[-0.05em] opacity-[0.05]"
        style={{ fontSize: 'clamp(120px, 22vw, 360px)' }}>
        Canaã
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-6 md:px-10 pt-[88px] pb-10">
        {/* CTA */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-end pb-14 mb-14 border-b border-white/[.12]">
          <h2 className="font-serif tracking-tight leading-none max-w-[16ch]" style={{ fontSize: 'clamp(36px, 4.5vw, 60px)' }}>
            Há um <em className="italic text-accent">assento</em><br />esperando por você.
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/contato" className="btn-accent h-[46px] px-5 rounded-full text-[15px] font-medium">
              Vir nos visitar
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/calendario"
              className="h-[46px] px-5 rounded-full text-[15px] font-medium inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white hover:text-foreground transition">
              Ver agenda
            </Link>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-mono text-[11px] uppercase tracking-[.18em] text-white/50 mb-5">— A igreja</div>
            <p className="text-[14px] leading-[1.6] text-white/70 max-w-[36ch]">
              Primeira Igreja Batista de Capim Grosso. Uma comunidade de fé, comunhão e missão desde 1978, no coração da Bahia.
            </p>
          </div>

          {/* Conheça */}
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[.18em] text-white/50 mb-5">— Conheça</div>
            <ul className="space-y-2.5 text-[14px] text-white/85">
              <li><Link href="/quem-somos" className="hover:text-accent transition">Quem somos</Link></li>
              <li><Link href="/historia" className="hover:text-accent transition">História</Link></li>
              <li><Link href="/visao" className="hover:text-accent transition">Visão</Link></li>
              <li><Link href="/pastor" className="hover:text-accent transition">Pastor</Link></li>
            </ul>
          </div>

          {/* Participe */}
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[.18em] text-white/50 mb-5">— Participe</div>
            <ul className="space-y-2.5 text-[14px] text-white/85">
              <li><Link href="/ministerios" className="hover:text-accent transition">Ministérios</Link></li>
              <li><Link href="/eventos" className="hover:text-accent transition">Eventos</Link></li>
              <li><Link href="/calendario" className="hover:text-accent transition">Calendário</Link></li>
              <li><Link href="/plano-leitura" className="hover:text-accent transition">Plano de leitura</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[.18em] text-white/50 mb-5">— Contato</div>
            <ul className="space-y-2.5 text-[14px] text-white/85">
              <li><Link href="/contato" className="hover:text-accent transition">Fale conosco</Link></li>
              <li><Link href="/contribua" className="hover:text-accent transition">Contribua</Link></li>
              {social.instagram && (
                <li><a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="hover:text-accent transition">Instagram</a></li>
              )}
              {social.youtube && (
                <li><a href={social.youtube} target="_blank" rel="noreferrer" className="hover:text-accent transition">YouTube</a></li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/[.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-[11px] text-white/40 tracking-[.08em]">
          <span>© {new Date().getFullYear()} PIBAC</span>
          <span>Capim Grosso · Bahia</span>
          <a href="https://instagram.com/wisetechprojects" target="_blank" rel="noreferrer" className="hover:text-accent transition">
            Desenvolvido por @wisetechprojects
          </a>
        </div>
      </div>
    </footer>
  )
}
