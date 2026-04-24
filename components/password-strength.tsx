'use client'

/**
 * PasswordStrength — medidor visual + checklist + gerador.
 *
 * Consome `lib/password-strength.ts` (zxcvbn-ts) e renderiza:
 *   - Barra colorida que cresce conforme a senha fica mais forte
 *   - Checklist com ✓/✗ para cada requisito (min 12, maiúscula, minúscula,
 *     número, símbolo, sem palavras óbvias do contexto)
 *   - Tempo estimado pra quebrar (ex: "Levaria séculos pra quebrar")
 *   - Botão "Gerar senha pra mim" — chama `generatePassphrase()` e devolve
 *     ao pai via prop (pai decide como plugar no input)
 *   - Caixa educativa explicando por que passphrase é melhor que "P@ssw0rd!"
 *
 * Stateless: recebe `password` via prop, avalia a cada render, devolve
 * `onGenerate(nova)` quando o usuário pede uma senha gerada.
 */

import { useMemo } from 'react'
import { Check, X, Sparkles, Info, Clock } from 'lucide-react'
import {
  evaluatePassword,
  generatePassphrase,
  PASSWORD_MIN_LENGTH,
  type ChecklistResult,
} from '@/lib/password-strength'
import { cn } from '@/lib/utils'

export interface PasswordStrengthProps {
  /** Senha digitada pelo usuário (valor atual do input). */
  password: string
  /**
   * Pistas de contexto (email, nome). zxcvbn usa pra dar score baixo se a
   * senha for derivada desses valores (ex: email "ana@x.com" + senha "ana123").
   */
  userInputs?: string[]
  /** Callback quando o usuário clica em "Gerar senha pra mim". */
  onGenerate?: (generated: string) => void
  /** Exibe a caixa educativa explicativa. Default: true. */
  showEducation?: boolean
  /** Classes extras no container. */
  className?: string
}

/**
 * Mapeia cor simbólica → classes Tailwind. Tailwind v4 descobre classes via
 * análise estática, então mantemos as strings literais aqui ao invés de
 * gerar dinamicamente.
 */
const COLOR_CLASSES: Record<
  'red' | 'orange' | 'yellow' | 'green' | 'emerald',
  { bar: string; text: string; bg: string }
> = {
  red: { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  orange: { bar: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  yellow: { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  green: { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50 dark:bg-green-950/30' },
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
}

const CHECKLIST_ITEMS: Array<{ key: keyof ChecklistResult; label: string }> = [
  { key: 'minLength', label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres` },
  { key: 'hasUpper', label: 'Uma letra MAIÚSCULA' },
  { key: 'hasLower', label: 'Uma letra minúscula' },
  { key: 'hasNumber', label: 'Um número' },
  { key: 'hasSymbol', label: 'Um símbolo (!@#$…)' },
  { key: 'noContextWords', label: 'Sem palavras óbvias (pibac, igreja, ano…)' },
]

export function PasswordStrength({
  password,
  userInputs = [],
  onGenerate,
  showEducation = true,
  className,
}: PasswordStrengthProps) {
  const evaluation = useMemo(
    () => evaluatePassword(password, userInputs),
    [password, userInputs]
  )

  const colors = COLOR_CLASSES[evaluation.strength.color]
  const percent = password.length === 0 ? 0 : evaluation.strength.percent

  const handleGenerate = () => {
    if (!onGenerate) return
    onGenerate(generatePassphrase())
  }

  return (
    <div className={cn('space-y-3', className)} data-testid="password-strength">
      {/* Barra de força */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-foreground">Força da senha</span>
          {password.length > 0 && (
            <span
              className={cn('text-xs font-semibold', colors.text)}
              data-testid="strength-label"
            >
              {evaluation.strength.label}
            </span>
          )}
        </div>
        <div
          className="h-2 w-full bg-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Força da senha"
        >
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              password.length > 0 ? colors.bar : 'bg-transparent'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        {/* Tempo estimado de quebra (só mostra se tiver senha) */}
        {password.length > 0 && (
          <p className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Levaria <strong className="text-foreground">{evaluation.crackTime}</strong> pra quebrar
          </p>
        )}
        {evaluation.warning && (
          <p className="mt-1 text-xs text-orange-600" data-testid="strength-warning">
            ⚠ {evaluation.warning}
          </p>
        )}
      </div>

      {/* Checklist ao vivo */}
      <ul className="space-y-1" data-testid="strength-checklist">
        {CHECKLIST_ITEMS.map(({ key, label }) => {
          const ok = evaluation.checklist[key]
          return (
            <li
              key={key}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                ok ? 'text-green-600' : 'text-muted-foreground'
              )}
              data-testid={`check-${key}`}
              data-ok={ok}
            >
              {ok ? (
                <Check className="h-3.5 w-3.5 shrink-0" aria-label="cumprido" />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0 opacity-60" aria-label="faltando" />
              )}
              <span className={ok ? 'line-through decoration-green-600/40' : ''}>
                {label}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Botão gerar */}
      {onGenerate && (
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition"
          data-testid="generate-password"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Gerar senha forte pra mim
        </button>
      )}

      {/* Caixa educativa */}
      {showEducation && (
        <div
          className="flex gap-2 p-3 rounded-md bg-accent/10 border border-accent/30 text-xs"
          data-testid="education-box"
        >
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-foreground">
            <p className="font-medium">Dica de segurança</p>
            <p className="text-muted-foreground leading-relaxed">
              Senhas como <code className="px-1 py-0.5 rounded bg-muted text-[10px]">P@ssw0rd!</code>{' '}
              são quebradas em segundos. Prefira frases-senha longas com palavras
              aleatórias, ex: <code className="px-1 py-0.5 rounded bg-muted text-[10px]">azul-Rubro-47-cafe-pomba#</code>{' '}
              — fácil de lembrar, levaria séculos pra quebrar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
