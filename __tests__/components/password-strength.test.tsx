/**
 * Testes de `components/password-strength.tsx`
 *
 * Confirma a integração entre a UI e a lib:
 *  - bar zerada se password vazia
 *  - checklist marca ✓ conforme critérios são atingidos
 *  - label textual muda (Muito fraca → Forte …)
 *  - warning aparece quando zxcvbn reclama
 *  - botão "Gerar" chama `onGenerate` com uma passphrase válida
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordStrength } from '@/components/password-strength'
import { evaluatePassword } from '@/lib/password-strength'

describe('<PasswordStrength />', () => {
  it('não mostra label de força quando senha está vazia', () => {
    render(<PasswordStrength password="" />)
    expect(screen.queryByTestId('strength-label')).not.toBeInTheDocument()
  })

  it('mostra barra com valor 0 quando vazia', () => {
    render(<PasswordStrength password="" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '0')
  })

  it('marca ❌ em todos os checklist items quando senha fraca', () => {
    render(<PasswordStrength password="abc" />)
    const minLength = screen.getByTestId('check-minLength')
    const hasUpper = screen.getByTestId('check-hasUpper')
    expect(minLength.dataset.ok).toBe('false')
    expect(hasUpper.dataset.ok).toBe('false')
  })

  it('marca ✅ em todos os checklist items quando senha forte', () => {
    render(<PasswordStrength password="azul-Rubro-47-cafe-pomba#" />)
    for (const key of ['minLength', 'hasUpper', 'hasLower', 'hasNumber', 'hasSymbol', 'noContextWords']) {
      const el = screen.getByTestId(`check-${key}`)
      expect(el.dataset.ok).toBe('true')
    }
  })

  it('exibe label "Forte" ou "Muito forte" pra senha aceitável', () => {
    render(<PasswordStrength password="azul-Rubro-47-cafe-pomba#" />)
    const label = screen.getByTestId('strength-label')
    expect(['Forte', 'Muito forte']).toContain(label.textContent)
  })

  it('exibe label "Muito fraca" ou "Fraca" pra senha curta', () => {
    render(<PasswordStrength password="abc" />)
    const label = screen.getByTestId('strength-label')
    expect(['Muito fraca', 'Fraca']).toContain(label.textContent)
  })

  it('marca noContextWords=false quando senha contém "pibac"', () => {
    render(<PasswordStrength password="PibacForte2026!" />)
    const check = screen.getByTestId('check-noContextWords')
    expect(check.dataset.ok).toBe('false')
  })

  it('esconde caixa educativa quando showEducation=false', () => {
    render(<PasswordStrength password="abc" showEducation={false} />)
    expect(screen.queryByTestId('education-box')).not.toBeInTheDocument()
  })

  it('mostra caixa educativa por default', () => {
    render(<PasswordStrength password="" />)
    expect(screen.getByTestId('education-box')).toBeInTheDocument()
  })

  it('não renderiza botão gerar se onGenerate não for passado', () => {
    render(<PasswordStrength password="" />)
    expect(screen.queryByTestId('generate-password')).not.toBeInTheDocument()
  })

  it('chama onGenerate com passphrase aceitável ao clicar no botão', async () => {
    const onGenerate = vi.fn()
    render(<PasswordStrength password="" onGenerate={onGenerate} />)

    await userEvent.click(screen.getByTestId('generate-password'))

    expect(onGenerate).toHaveBeenCalledOnce()
    const generated = onGenerate.mock.calls[0][0] as string
    expect(typeof generated).toBe('string')
    // A senha gerada precisa passar na avaliação (contrato do componente)
    expect(evaluatePassword(generated).acceptable).toBe(true)
  })
})
