'use client'

import { useEffect, useCallback } from 'react'

/**
 * Hook que protege contra perda de edições não salvas.
 *
 * - Registra `beforeunload` quando `dirty=true` (fechar aba/navegar fora)
 * - Expõe `confirmIfDirty(callback)` para interceptar ações internas
 *   (ex: trocar de aba no admin) com um confirm dialog
 *
 * @param dirty — true se há edições pendentes
 */
export function useUnsavedChanges(dirty: boolean) {
  // beforeunload — protege contra fechar aba ou recarregar
  useEffect(() => {
    if (!dirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Browsers modernos ignoram o returnValue customizado mas exigem que seja setado
      e.returnValue = 'Você tem alterações não salvas. Deseja sair?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Confirm dialog para ações internas (ex: trocar de aba)
  const confirmIfDirty = useCallback(
    (callback: () => void) => {
      if (!dirty) {
        callback()
        return
      }
      const ok = window.confirm(
        'Você tem alterações não salvas. Deseja sair sem salvar?'
      )
      if (ok) callback()
    },
    [dirty]
  )

  return { confirmIfDirty }
}
