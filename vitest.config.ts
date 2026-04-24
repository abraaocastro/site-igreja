/**
 * Vitest config — test runner para TDD do fluxo de auth.
 *
 * Usa jsdom pra simular DOM (Testing Library precisa), plugin React pra
 * transformar JSX, e alias `@/*` igual ao Next (espelha tsconfig.paths).
 *
 * Exclui `node_modules`, `.next` e `scripts/` (CLI scripts, não precisam
 * de teste unitário aqui).
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    css: false,
    // Windows + jsdom + zxcvbn são lentos no primeiro render (lexicalização
    // de grafos de adjacência). 15s dá folga sem mascarar bugs reais.
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
})
