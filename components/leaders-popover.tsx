'use client'

/**
 * LeadersDisplay — exibe liderança de um ministério.
 *
 * - 1 líder: mostra inline (nome + Instagram clicável)
 * - 2+ líderes: botão "Liderança (N)" que abre popover com a lista
 */

import { useEffect, useRef, useState } from 'react'
import { Instagram, UserCheck, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type CmsMinisterioLeader } from '@/lib/cms'

interface LeadersDisplayProps {
  leaders: CmsMinisterioLeader[]
  className?: string
}

export function LeadersDisplay({ leaders, className }: LeadersDisplayProps) {
  if (!leaders || leaders.length === 0) return null

  // 1 líder: inline
  if (leaders.length === 1) {
    const l = leaders[0]
    return (
      <div className={cn('flex flex-col gap-1 min-w-0', className)}>
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
          <UserCheck className="h-3.5 w-3.5 text-primary" />
          Líder: <strong className="truncate">{l.name}</strong>
        </span>
        {l.instagram && (
          <a
            href={l.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition w-fit"
            aria-label={`Instagram de ${l.name}`}
          >
            <Instagram className="h-3 w-3" />
            <span className="truncate">
              {'@' + l.instagram.replace(/\/$/, '').split('/').pop()}
            </span>
          </a>
        )}
      </div>
    )
  }

  // 2+ líderes: botão + popover
  return <LeadersPopover leaders={leaders} className={className} />
}

function LeadersPopover({
  leaders,
  className,
}: {
  leaders: CmsMinisterioLeader[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition',
          open
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent/15 text-primary hover:bg-accent/25'
        )}
      >
        <Users className="h-3.5 w-3.5" />
        Liderança ({leaders.length})
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-64 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-xl ring-1 ring-black/5 p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">Liderança</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {leaders.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-sm text-foreground truncate">{l.name}</span>
                {l.instagram && (
                  <a
                    href={l.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition shrink-0"
                    aria-label={`Instagram de ${l.name}`}
                  >
                    <Instagram className="h-3 w-3" />
                    <span className="truncate max-w-[80px]">
                      {'@' + l.instagram.replace(/\/$/, '').split('/').pop()}
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
