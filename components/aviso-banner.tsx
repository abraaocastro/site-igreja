'use client'

/**
 * AvisoBanner — banner global de avisos.
 *
 * Renderiza no topo de TODAS as páginas (injetado em `app/layout.tsx` acima
 * do `<Header>`) **apenas** quando `aviso.ativo === true`.
 *
 * Fonte de dados (Phase 8):
 *  - SSR/build: `getChurch().aviso` (default estático)
 *  - Hidratação client: substitui pelo conteúdo do banco via `getAviso()`
 *  - Quando admin publica em /admin/avisos, o banco recebe e a próxima carga
 *    de qualquer página exibe pra todo mundo.
 *
 * Dispensa:
 *  - Botão X persiste em `sessionStorage` com chave `pibac-aviso-dismissed:<hash>`
 *  - O hash é da mensagem — se admin trocar o texto, o banner reaparece mesmo
 *    pra quem dispensou a versão anterior.
 *
 * Props:
 *  - `aviso?`     → injeta aviso ad-hoc (usado pelo preview do admin)
 *  - `forceOpen?` → ignora dispensa e esconde botão X (preview)
 */

import { useEffect, useState } from 'react'
import { Info, AlertTriangle, AlertOctagon, X, ArrowUpRight } from 'lucide-react'
import { getChurch, type ChurchAviso, type AvisoSeveridade } from '@/lib/site-data'
import { getAviso } from '@/lib/cms'
import { cn } from '@/lib/utils'

const DISMISS_KEY_PREFIX = 'pibac-aviso-dismissed:'

/**
 * Hash simples e estável da mensagem pra usar como chave de sessionStorage.
 * Não precisa ser criptográfico — só precisa mudar quando a mensagem muda.
 */
function hashMessage(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

const SEVERITY_STYLES: Record<
  AvisoSeveridade,
  { container: string; icon: typeof Info; iconClass: string; label: string }
> = {
  info: {
    container: 'bg-accent/10 border-accent/30 text-foreground',
    icon: Info,
    iconClass: 'text-accent',
    label: 'Informação',
  },
  atencao: {
    container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-100',
    icon: AlertTriangle,
    iconClass: 'text-yellow-600 dark:text-yellow-300',
    label: 'Atenção',
  },
  urgente: {
    container: 'bg-destructive/10 border-destructive/40 text-foreground',
    icon: AlertOctagon,
    iconClass: 'text-destructive',
    label: 'Urgente',
  },
}

export interface AvisoBannerProps {
  /**
   * Se passado, sobrepõe a leitura do JSON/localStorage. Útil pra preview
   * no painel admin sem persistir nada.
   */
  aviso?: ChurchAviso
  /** Se true, ignora o sessionStorage de dispensa (também útil em preview). */
  forceOpen?: boolean
  className?: string
}

export function AvisoBanner({ aviso: avisoProp, forceOpen = false, className }: AvisoBannerProps) {
  // Default vem do JSON (server-rendered). useState com lazy init evita
  // re-leitura do JSON em cada render.
  const [aviso, setAviso] = useState<ChurchAviso>(() => avisoProp ?? getChurch().aviso)
  const [dismissed, setDismissed] = useState(false)
  // Hidratado só vira true após o primeiro useEffect — evita flash do estado
  // dispensed durante SSR (sessionStorage não existe no servidor).
  const [hydrated, setHydrated] = useState(false)

  // Se a prop muda em tempo de execução (preview do admin), reflete.
  useEffect(() => {
    if (avisoProp) setAviso(avisoProp)
  }, [avisoProp])

  // Hidratação client-side: busca aviso atualizado do banco.
  // Default estático do JSON serve como SSR fallback (evita flash vazio).
  useEffect(() => {
    if (avisoProp) {
      // Modo controlado (preview do admin): ignora banco; só escuta a prop.
      setHydrated(true)
      return
    }

    let cancelled = false
    getAviso()
      .then((fromDb) => {
        if (!cancelled) setAviso(fromDb)
      })
      .catch(() => {
        // Sem banco / RLS bloqueou: continua com default estático.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [avisoProp])

  // Quando o aviso final muda, reavalia se já foi dispensado nessa sessão.
  useEffect(() => {
    if (!hydrated) return
    if (forceOpen) {
      setDismissed(false)
      return
    }
    try {
      const key = DISMISS_KEY_PREFIX + hashMessage(aviso.mensagem)
      setDismissed(window.sessionStorage.getItem(key) === '1')
    } catch {
      setDismissed(false)
    }
  }, [aviso.mensagem, forceOpen, hydrated])

  const handleDismiss = () => {
    try {
      const key = DISMISS_KEY_PREFIX + hashMessage(aviso.mensagem)
      window.sessionStorage.setItem(key, '1')
    } catch {
      // Quota cheia ou ambiente sem sessionStorage — ainda some da tela
    }
    setDismissed(true)
  }

  // Não renderiza se: inativo, sem mensagem, dispensado, ou ainda não
  // hidratou (evita flash do banner antes de checar o sessionStorage).
  if (!aviso.ativo || !aviso.mensagem.trim()) return null
  if (!hydrated && !avisoProp) return null
  if (dismissed) return null

  const style = SEVERITY_STYLES[aviso.severidade] ?? SEVERITY_STYLES.info
  const Icon = style.icon

  return (
    <div
      role="status"
      aria-live={aviso.severidade === 'urgente' ? 'assertive' : 'polite'}
      data-testid="aviso-banner"
      data-severity={aviso.severidade}
      className={cn(
        'border-b animate-fade-in',
        style.container,
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-start gap-3">
        <Icon
          className={cn('h-5 w-5 shrink-0 mt-0.5', style.iconClass)}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 text-sm leading-relaxed flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 shrink-0">
            {style.label}
          </span>
          <span className="break-words" data-testid="aviso-message">
            {aviso.mensagem}
          </span>
          {aviso.link && (aviso.linkTexto || aviso.link) && (
            <a
              href={aviso.link}
              target={aviso.link.startsWith('http') ? '_blank' : undefined}
              rel={aviso.link.startsWith('http') ? 'noreferrer' : undefined}
              data-testid="aviso-link"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:no-underline"
            >
              {aviso.linkTexto || aviso.link}
              {aviso.link.startsWith('http') && <ArrowUpRight className="h-3 w-3" />}
            </a>
          )}
        </div>
        {!forceOpen && (
          <button
            type="button"
            onClick={handleDismiss}
            data-testid="aviso-dismiss"
            aria-label="Fechar aviso"
            className="shrink-0 p-1 -m-1 rounded hover:bg-foreground/5 transition-colors"
          >
            <X className="h-4 w-4 opacity-70" />
          </button>
        )}
      </div>
    </div>
  )
}
