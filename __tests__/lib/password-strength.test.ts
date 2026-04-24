/**
 * Testes de `lib/password-strength.ts`
 *
 * Foca em:
 *  - `evaluatePassword`: checklist correto, scores esperados, acceptable=true
 *    só quando TODOS os requisitos passam, issues traduzidas em PT-BR.
 *  - `generatePassphrase`: formato esperado, sempre aceitável, aleatória.
 */

import { describe, it, expect } from 'vitest'
import {
  evaluatePassword,
  generatePassphrase,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_SCORE,
} from '@/lib/password-strength'

describe('evaluatePassword — checklist', () => {
  it('reprova senha vazia em todos os critérios exceto noContextWords', () => {
    const r = evaluatePassword('')
    expect(r.checklist.minLength).toBe(false)
    expect(r.checklist.hasUpper).toBe(false)
    expect(r.checklist.hasLower).toBe(false)
    expect(r.checklist.hasNumber).toBe(false)
    expect(r.checklist.hasSymbol).toBe(false)
    // String vazia não contém palavra de contexto
    expect(r.checklist.noContextWords).toBe(true)
    expect(r.acceptable).toBe(false)
    expect(r.issues.length).toBeGreaterThan(0)
  })

  it('reprova senhas curtas mesmo que fortes em variedade', () => {
    const r = evaluatePassword('Ab1!xY')
    expect(r.checklist.minLength).toBe(false)
    expect(r.acceptable).toBe(false)
    expect(r.issues).toContain(`Use ao menos ${PASSWORD_MIN_LENGTH} caracteres`)
  })

  it('reprova quando falta maiúscula', () => {
    const r = evaluatePassword('abcdef123456!@')
    expect(r.checklist.hasUpper).toBe(false)
    expect(r.issues).toContain('Adicione uma letra MAIÚSCULA')
  })

  it('reprova quando falta minúscula', () => {
    const r = evaluatePassword('ABCDEF123456!@')
    expect(r.checklist.hasLower).toBe(false)
    expect(r.issues).toContain('Adicione uma letra minúscula')
  })

  it('reprova quando falta número', () => {
    const r = evaluatePassword('AbcdefXYZabc!@')
    expect(r.checklist.hasNumber).toBe(false)
    expect(r.issues).toContain('Adicione um número')
  })

  it('reprova quando falta símbolo', () => {
    const r = evaluatePassword('Abcdef123456XY')
    expect(r.checklist.hasSymbol).toBe(false)
    expect(r.issues).toContain('Adicione um símbolo (!@#$…)')
  })

  it('reprova senhas com palavras de contexto (pibac, igreja, 2026…)', () => {
    const r = evaluatePassword('Pibac@2026Forte!')
    expect(r.checklist.noContextWords).toBe(false)
    expect(r.issues).toContain(
      'Evite palavras óbvias (pibac, igreja, pastor, ano atual…)'
    )
  })

  it('reprova "Igreja123Batista!" por conter palavras de contexto', () => {
    const r = evaluatePassword('Igreja123Batista!')
    expect(r.checklist.noContextWords).toBe(false)
  })
})

describe('evaluatePassword — acceptable', () => {
  it('aceita passphrase EFF-style bem aleatória', () => {
    // Passphrase com 4 palavras, maiúscula, dígitos e símbolo — >= 12 chars,
    // sem palavras de contexto.
    const r = evaluatePassword('azul-Rubro-47-cafe-pomba#')
    expect(r.checklist.minLength).toBe(true)
    expect(r.checklist.hasUpper).toBe(true)
    expect(r.checklist.hasLower).toBe(true)
    expect(r.checklist.hasNumber).toBe(true)
    expect(r.checklist.hasSymbol).toBe(true)
    expect(r.checklist.noContextWords).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(PASSWORD_MIN_SCORE)
    expect(r.acceptable).toBe(true)
    expect(r.issues).toEqual([])
  })

  it('retorna strength label + color correspondente ao score', () => {
    const r = evaluatePassword('azul-Rubro-47-cafe-pomba#')
    expect(['Forte', 'Muito forte']).toContain(r.strength.label)
    expect(['green', 'emerald']).toContain(r.strength.color)
    expect(r.strength.percent).toBeGreaterThanOrEqual(80)
  })

  it('retorna crackTime como string (não vazio para senha forte)', () => {
    const r = evaluatePassword('azul-Rubro-47-cafe-pomba#')
    expect(typeof r.crackTime).toBe('string')
    expect(r.crackTime.length).toBeGreaterThan(0)
  })

  it('usa userInputs pra penalizar senha derivada do nome do usuário', () => {
    // Baseline: sem userInputs, essa senha tem certa estrutura.
    const baseline = evaluatePassword('AnaSilva@2026')
    // Com o nome como userInput, o score deve ser no máximo igual ao baseline
    // (nunca maior). Idealmente vem mais baixo.
    const withInputs = evaluatePassword('AnaSilva@2026', ['ana.silva@x.com', 'Ana Silva'])
    expect(withInputs.score).toBeLessThanOrEqual(baseline.score)
    // De qualquer forma, essa senha falha no checklist (contém "2026")
    expect(withInputs.checklist.noContextWords).toBe(false)
    expect(withInputs.acceptable).toBe(false)
  })
})

describe('generatePassphrase', () => {
  it('gera senha no formato "palavra-Palavra-##-palavra-palavra#"', () => {
    const pw = generatePassphrase()
    // 4 palavras separadas por hífen + símbolo no final
    const parts = pw.split('-')
    expect(parts.length).toBe(5)
    // Último segmento é "palavra<sym>" (um símbolo no final)
    expect(/[!@#$%&*]$/.test(parts[4])).toBe(true)
    // Algum segmento é numérico de 2 dígitos
    expect(parts.some((p) => /^\d{2}$/.test(p))).toBe(true)
  })

  it('sempre retorna senha aceitável (score >= 3 + checklist completo)', () => {
    // Sample grande pra pegar corner cases
    for (let i = 0; i < 30; i++) {
      const pw = generatePassphrase()
      const r = evaluatePassword(pw)
      expect(r.checklist.minLength).toBe(true)
      expect(r.checklist.hasUpper).toBe(true)
      expect(r.checklist.hasLower).toBe(true)
      expect(r.checklist.hasNumber).toBe(true)
      expect(r.checklist.hasSymbol).toBe(true)
      expect(r.checklist.noContextWords).toBe(true)
      expect(r.score).toBeGreaterThanOrEqual(PASSWORD_MIN_SCORE)
      expect(r.acceptable).toBe(true)
    }
  })

  it('gera senhas distintas entre chamadas', () => {
    const set = new Set<string>()
    for (let i = 0; i < 20; i++) set.add(generatePassphrase())
    // Colisão quase impossível com 128-word list + 90 dígitos + 7 símbolos
    expect(set.size).toBeGreaterThan(15)
  })
})
