'use client'

/**
 * HelpHint — pequeno ícone "?" que abre um popover explicativo.
 *
 * Substitui as caixas "Como funciona" que ficavam embutidas no admin.
 * Esse componente é discreto: aparece como um botão circular com `?`,
 * e ao clicar mostra um balãozinho com texto curto explicando aquela
 * aba/campo. Fecha ao clicar fora.
 *
 * Uso:
 *   <HelpHint label="Como funciona o aviso global">
 *     Quando você ativa, aparece um banner no topo de todas as páginas...
 *   </HelpHint>
 *
 * Acessibilidade:
 *  - Botão com aria-label e aria-expanded
 *  - Conteúdo do popover com role="dialog"
 *  - Esc fecha
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpHintProps {
  /** Texto curto pro aria-label (ex: "Como funciona a aba Avisos"). */
  label: string
  /** Conteúdo do popover. Pode incluir <code>, <strong>, <ul>, etc. */
  children: ReactNode
  /** Lado em que o popover aparece relativo ao botão. */
  side?: 'right' | 'left' | 'bottom'
  className?: string
}

export function HelpHint({ label, children, side = 'right', className }: HelpHintProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora ou pressionar Esc
  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Posicionamento do popover por lado escolhido
  const sidePos =
    side === 'left'
      ? 'right-full mr-2 top-0'
      : side === 'bottom'
        ? 'top-full mt-2 left-1/2 -translate-x-1/2'
        : 'left-full ml-2 top-0'

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        className={cn(
          'inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors align-middle',
          open && 'bg-muted text-foreground'
        )}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute z-50 w-72 max-w-[calc(100vw-2rem)] p-3 rounded-lg bg-card border border-border shadow-xl ring-1 ring-black/5 animate-fade-in text-left',
            sidePos
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="shrink-0 -mt-0.5 -mr-0.5 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
