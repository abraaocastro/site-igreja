/**
 * password-strength — helpers para medir e gerar senhas fortes.
 *
 * Usa zxcvbn-ts (port TypeScript do algoritmo do Dropbox) para estimar
 * quanto tempo um atacante levaria pra quebrar a senha via força bruta
 * inteligente (listas de palavras comuns, padrões de teclado, datas…).
 *
 * Também fornece:
 *  - `evaluatePassword(password, userInputs)` — score + erros do checklist
 *  - `generatePassphrase()` — passphrase EFF-style pronta pra uso
 */

import { zxcvbnOptions, zxcvbn } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnPtBrPackage from '@zxcvbn-ts/language-pt-br'

// Configura o zxcvbn com dicionários PT-BR + comuns (senhas vazadas, sobrenomes etc.)
// Rodado uma única vez no import.
zxcvbnOptions.setOptions({
  translations: zxcvbnPtBrPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnPtBrPackage.dictionary,
    // Termos específicos do contexto PIBAC — se o usuário tentar usar
    // "pibac2026", "igreja123" etc, zxcvbn pontua baixo.
    userInputs: [
      'pibac',
      'pibaccapimgrosso',
      'igreja',
      'batista',
      'capim',
      'grosso',
      'eldorado',
      'silas',
      'barreto',
      'pastor',
    ],
  },
})

export type StrengthScore = 0 | 1 | 2 | 3 | 4

export interface StrengthLabel {
  label: string
  color: 'red' | 'orange' | 'yellow' | 'green' | 'emerald'
  /** Percentual da barra (0-100) */
  percent: number
}

export const STRENGTH_LABELS: Record<StrengthScore, StrengthLabel> = {
  0: { label: 'Muito fraca', color: 'red', percent: 15 },
  1: { label: 'Fraca', color: 'orange', percent: 35 },
  2: { label: 'Razoável', color: 'yellow', percent: 55 },
  3: { label: 'Forte', color: 'green', percent: 80 },
  4: { label: 'Muito forte', color: 'emerald', percent: 100 },
}

export interface ChecklistResult {
  minLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasNumber: boolean
  hasSymbol: boolean
  noContextWords: boolean
}

export interface PasswordEvaluation {
  score: StrengthScore
  strength: StrengthLabel
  checklist: ChecklistResult
  /** Tempo estimado pra quebrar (ex: "3 hours", "centuries") — já em PT-BR */
  crackTime: string
  /** Dica educativa, se houver (vinda do zxcvbn) */
  warning: string
  /** Se todos os requisitos mínimos + score ≥ 3 foram atingidos */
  acceptable: boolean
  /** Motivos pelos quais ainda não é aceitável (empty se acceptable). */
  issues: string[]
}

const MIN_LENGTH = 12
const MIN_SCORE: StrengthScore = 3

/**
 * Lista de palavras que, se aparecem na senha, invalidam (baixa muito o score
 * e nossa regra bloqueia no checklist).
 */
const CONTEXT_WORDS = [
  'pibac',
  'igreja',
  'batista',
  'capim',
  'grosso',
  'eldorado',
  'silas',
  'barreto',
  'pastor',
  '2024',
  '2025',
  '2026',
]

function runChecklist(password: string): ChecklistResult {
  const lower = password.toLowerCase()
  return {
    minLength: password.length >= MIN_LENGTH,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
    noContextWords: !CONTEXT_WORDS.some((w) => lower.includes(w)),
  }
}

export function evaluatePassword(password: string, userInputs: string[] = []): PasswordEvaluation {
  const checklist = runChecklist(password)
  const result = zxcvbn(password, userInputs)
  const score = result.score as StrengthScore
  const strength = STRENGTH_LABELS[score]

  const issues: string[] = []
  if (!checklist.minLength) issues.push(`Use ao menos ${MIN_LENGTH} caracteres`)
  if (!checklist.hasUpper) issues.push('Adicione uma letra MAIÚSCULA')
  if (!checklist.hasLower) issues.push('Adicione uma letra minúscula')
  if (!checklist.hasNumber) issues.push('Adicione um número')
  if (!checklist.hasSymbol) issues.push('Adicione um símbolo (!@#$…)')
  if (!checklist.noContextWords)
    issues.push('Evite palavras óbvias (pibac, igreja, pastor, ano atual…)')
  if (score < MIN_SCORE) issues.push('Senha muito previsível — tente algo mais aleatório')

  const acceptable = issues.length === 0

  return {
    score,
    strength,
    checklist,
    crackTime: String(result.crackTimesDisplay.offlineSlowHashing1e4PerSecond),
    warning: result.feedback.warning || '',
    acceptable,
    issues,
  }
}

// =========================================================================
// Gerador de passphrase (EFF-style)
// =========================================================================

/**
 * Pequena wordlist PT-BR (substantivos + adjetivos curtos, fáceis de digitar,
 * sem acentos). 128 palavras = ~7 bits de entropia por palavra. 4 palavras
 * + 2 dígitos + separador = ~36 bits, já cai em "Forte" no zxcvbn.
 */
const WORDLIST = [
  'azul','verde','rubro','dourado','prata','sol','lua','estrela','rio','mar',
  'monte','vale','lago','fonte','chuva','neve','vento','trovao','raio','aurora',
  'gato','cao','lobo','tigre','aguia','leao','urso','corvo','pomba','raposa',
  'cavalo','ovelha','abelha','peixe','golfinho','baleia','mula','anta','tatu','jaguar',
  'ferro','bronze','cobre','cristal','seda','algodao','madeira','pedra','vidro','papel',
  'violino','tambor','flauta','piano','harpa','viola','trompa','cajon','berimbau','sino',
  'azulejo','ponte','torre','casa','porta','janela','telhado','parede','jardim','horto',
  'livro','caneta','mapa','bussola','relogio','vela','chapeu','capa','bota','luva',
  'alegre','calmo','bravo','sabio','forte','doce','leve','denso','limpo','agil',
  'pronto','pleno','justo','amplo','quente','frio','tenro','claro','puro','morno',
  'arroz','feijao','pao','mel','cafe','cha','queijo','manga','uva','pera',
  'tijolo','prato','copo','faca','colher','garfo','panela','lenço','cesto','pincel',
  'planta','flor','folha','galho','raiz','fruto','broto','caule','bambu','cipo',
]

function cryptoRandomInt(max: number): number {
  // Usa crypto.getRandomValues quando disponível (browser/Node >= 18 com globalThis.crypto)
  const g = globalThis as { crypto?: Crypto }
  if (g.crypto?.getRandomValues) {
    const arr = new Uint32Array(1)
    g.crypto.getRandomValues(arr)
    return arr[0] % max
  }
  // Fallback (pior caso, mas ainda ok pra gerar senha).
  return Math.floor(Math.random() * max)
}

function pickWord(): string {
  return WORDLIST[cryptoRandomInt(WORDLIST.length)]
}

/**
 * Gera uma passphrase no formato `palavra-Palavra-42-palavra-palavra#`
 * com 4 palavras, uma capitalizada, 2 dígitos e 1 símbolo.
 * Sempre pontua ≥ 3 no zxcvbn.
 */
export function generatePassphrase(): string {
  const words: string[] = []
  for (let i = 0; i < 4; i++) words.push(pickWord())
  // Capitaliza uma palavra aleatória pra atender requisito de maiúscula.
  const upperIdx = cryptoRandomInt(4)
  words[upperIdx] = words[upperIdx][0].toUpperCase() + words[upperIdx].slice(1)
  const digits = String(cryptoRandomInt(90) + 10) // 10-99
  const symbols = ['!', '@', '#', '$', '%', '&', '*']
  const sym = symbols[cryptoRandomInt(symbols.length)]
  // Exemplo: "azul-Rubro-47-cafe-pomba#"
  return `${words[0]}-${words[1]}-${digits}-${words[2]}-${words[3]}${sym}`
}

export const PASSWORD_MIN_LENGTH = MIN_LENGTH
export const PASSWORD_MIN_SCORE = MIN_SCORE
