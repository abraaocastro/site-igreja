/**
 * Setup global dos testes (executado antes de cada arquivo de teste).
 *
 * - Carrega matchers do jest-dom (`toBeInTheDocument`, `toHaveTextContent` etc.)
 * - Limpa DOM entre testes automaticamente (RTL faz isso, mas deixamos
 *   explícito via `afterEach(cleanup)` caso queiramos customizar).
 * - Polyfill mínimo pra `crypto.getRandomValues` (jsdom não tem em todas as
 *   versões; node tem globalThis.crypto desde 20).
 */

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// Garantir crypto.getRandomValues mesmo em jsdom antigo
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  // node:crypto.webcrypto é compatível com a Web Crypto API
  // (disponível desde Node 18).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { webcrypto } = require('node:crypto')
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  })
}
