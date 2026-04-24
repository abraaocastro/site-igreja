# SPECDESIGN — Handoff de UI pro Claude Design

> **Para quem lê:** este arquivo é o contrato entre o **backend** (mantido por agente automatizado) e o **frontend** (feito no Claude Design pelo humano).
>
> **Regra de divisão:**
> - **Backend** = dados, auth, RLS, middleware, helpers, hooks, testes, migrations, scripts.
> - **Frontend** = layout, cor, tipografia, espaçamento, microinterações, responsivo.
>
> Backend expõe APIs estáveis (tabela abaixo). Frontend consome e redesenha à vontade SEM mexer em `lib/`, `supabase/`, `middleware.ts`, `scripts/` ou `__tests__/`.

**Última atualização:** 2026-04-23
**SPEC correspondente:** [`SPEC.md`](./SPEC.md) v2.1
**PROGRESS:** [`PROGRESS.md`](./PROGRESS.md)

---

## 0. Como usar este doc

Ao abrir o Claude Design:

1. Escolha uma página da tabela §3.
2. Leia o "contrato" (props/hooks/estado) da seção correspondente.
3. Redesenhe o JSX dentro dos limites "fronteira backend" (abaixo).
4. **Nunca mexer** em arquivos marcados 🚫.
5. Testes devem continuar verdes: `npm test && npm run typecheck && npm run build`.

---

## 1. Fronteira backend ↔ frontend

### 🚫 NÃO alterar (domínio do backend)

```
lib/auth.tsx                        Hook useAuth — API pública estável
lib/supabase/*.ts                   Clientes Supabase
lib/password-strength.ts            evaluatePassword + generatePassphrase
lib/site-data.ts                    Reader de data/church.json + helpers
middleware.ts                       Guard de rota
scripts/bootstrap-admin.ts          CLI de bootstrap
supabase/migrations/*.sql           Schema do banco
__tests__/                          Testes TDD
data/church.json                    Dados canônicos (editar via PR/admin)
```

### ✅ Livre para redesenhar

```
app/**/page.tsx                     Páginas — JSX, estilo, layout
app/**/layout.tsx                   Layouts
app/globals.css                     CSS global, tokens, animações
components/**/*.tsx                 Componentes visuais
components/ui/*.tsx                 shadcn primitives já instaladas
```

### ⚠️ Zona cinza (precisa combinar)

```
components/password-strength.tsx    Lógica de render OK pra mudar,
                                    mas a prop `onGenerate` é contrato
                                    e `evaluatePassword()` é fonte da verdade
app/admin/primeiro-acesso/page.tsx  Fluxo (redirect, submit) = backend
                                    Layout = frontend
```

---

## 2. Hooks e APIs estáveis (contrato)

Qualquer página pode importar e consumir estes recursos. **Nunca mudam sem aviso.**

### `useAuth()` — autenticação
```tsx
import { useAuth } from '@/lib/auth'

const {
  user,                // User | null  (Supabase: id, email, user_metadata)
  profile,             // { id, email, nome, role: 'admin'|'conteudista' } | null
  loading,             // boolean — true até a primeira getSession resolver
  mustChangePassword,  // boolean — se true, middleware já redirecionou
  login,               // (email, password) => Promise<{ ok: boolean; error?: string }>
  logout,              // () => Promise<void>
  refreshProfile,      // () => Promise<void>
} = useAuth()
```

Erros de login já vêm **traduzidos em PT-BR**.

### `getChurch()` — dados institucionais
```tsx
import {
  getChurch,
  formatAddressOneLine, formatPhone, telHref, mailtoHref, whatsappHref,
  getMapsSearchUrl, getMapsDirectionsUrl, getMapsEmbedUrl,
  hasPix, safeValue, isTodo,
} from '@/lib/site-data'

const church = getChurch()
// church.nome, church.endereco.bairro, church.contato.whatsapp, etc.
```

### `evaluatePassword()` / `generatePassphrase()` — força de senha
```tsx
import { evaluatePassword, generatePassphrase } from '@/lib/password-strength'

const r = evaluatePassword(password, [email, nome])
// r.score (0-4), r.strength.{label,color,percent}, r.checklist, r.crackTime,
// r.warning, r.acceptable, r.issues

const generated = generatePassphrase()
// "azul-Rubro-47-cafe-pomba#"  — sempre aceitável
```

---

## 3. Páginas — status do design

| Rota | Arquivo | Status do design | Precisa do Claude Design? |
|---|---|---|---|
| `/` | `app/page.tsx` | ✅ Pronto | — |
| `/quem-somos` | `app/quem-somos/page.tsx` | ✅ Pronto | — |
| `/historia` | `app/historia/page.tsx` | ✅ Pronto | — |
| `/visao` | `app/visao/page.tsx` | ✅ Pronto | — |
| `/pastor` | `app/pastor/page.tsx` | ✅ Pronto | — |
| `/ministerios` | `app/ministerios/page.tsx` | ✅ Pronto | — |
| `/eventos` | `app/eventos/page.tsx` | ✅ Pronto | — |
| `/calendario` | `app/calendario/page.tsx` | ✅ Pronto | — |
| `/plano-leitura` | `app/plano-leitura/page.tsx` | ✅ Pronto | — |
| `/contribua` | `app/contribua/page.tsx` | ✅ Pronto | — |
| `/contato` | `app/contato/page.tsx` | ✅ Pronto | — |
| `/login` | `app/login/page.tsx` | ✅ Pronto | — |
| `/admin` | `app/admin/page.tsx` | ✅ Pronto | — |
| **`/admin/primeiro-acesso`** | `app/admin/primeiro-acesso/page.tsx` | ⚠️ **Funcional mas básico** | ✳️ **SIM** — ver §4.1 |

### Componentes

| Componente | Arquivo | Status | Precisa do Claude Design? |
|---|---|---|---|
| Header | `components/layout/header.tsx` | ✅ Pronto | — |
| Footer | `components/layout/footer.tsx` | ✅ Pronto | — |
| Banner carousel | `components/banner-carousel.tsx` | ✅ Pronto | — |
| Section title | `components/section-title.tsx` | ✅ Pronto | — |
| **Password strength** | `components/password-strength.tsx` | ⚠️ **Funcional mas básico** | ✳️ **SIM** — ver §4.2 |
| **Aviso banner** | _não existe ainda_ | ⬜ Phase 4 | ✳️ **SIM** — ver §4.3 |

---

## 4. Pedidos de design abertos

### 4.1. `/admin/primeiro-acesso` — troca forçada de senha no primeiro login

**Contexto:** usuário loga pela primeira vez com senha temporária. O middleware o redireciona aqui e ele só sai depois de escolher uma senha nova forte.

**Fluxo funcional (não mudar):**
1. Middleware já garantiu que tem sessão + `must_change_password: true`.
2. Usuário digita nova senha → componente mostra força em tempo real.
3. Pode clicar "Gerar senha pra mim" → preenche campos + copia pro clipboard.
4. Confirma senha (campo separado).
5. Submit chama `supabase.auth.updateUser({ password, data: { must_change_password: false } })`.
6. Sucesso → `router.replace('/admin')`.

**Hooks/APIs disponíveis:**
- `useAuth()` → `user`, `loading`, `mustChangePassword`, `refreshProfile`
- `createClient()` → cliente Supabase (pode ser `null` se envs faltarem)
- `evaluatePassword(pw, [email, nome])` → validação
- `<PasswordStrength>` → componente pronto (redesenhável — §4.2)

**Estado local atual:**
```tsx
const [password, setPassword] = useState('')
const [confirm, setConfirm] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [submitting, setSubmitting] = useState(false)
```

**Requisitos visuais pedidos:**
- Transmitir "isso é importante, não é burocracia" (cadeado, escudo, tom sério mas acolhedor)
- Explicar **por que** trocar a senha (a temporária foi gerada por outra pessoa)
- Botão "Mostrar/ocultar senha" visível (usuário provavelmente usou a senha gerada e precisa conferir)
- Botão "Copiar senha" (pra ele colar num gerenciador)
- Indicação forte quando a nova senha estiver igual à confirmação (✓ verde)
- Destaque quando acceptable=true (botão primário habilitado)
- Mobile-first — admin pode acessar do celular

**Branding:** usar tokens existentes (`bg-brand-gradient`, `text-primary`, `bg-accent/10`). Logo da igreja em `/logo.png`.

---

### 4.2. `<PasswordStrength>` — medidor de força de senha

**Contrato de props (não mudar):**
```tsx
interface PasswordStrengthProps {
  password: string                               // input atual
  userInputs?: string[]                          // [email, nome] — pra penalizar senhas óbvias
  onGenerate?: (generated: string) => void       // clique em "gerar"
  showEducation?: boolean                        // default true
  className?: string
}
```

**O que tem que aparecer (dados vêm do `evaluatePassword()`):**
1. **Barra de progresso** horizontal — cor muda (red → orange → yellow → green → emerald) conforme score 0→4, e largura `strength.percent`.
2. **Label textual** ("Muito fraca", "Fraca", "Razoável", "Forte", "Muito forte").
3. **Crack time** — "Levaria `X` pra quebrar" (X vem em PT-BR do zxcvbn).
4. **Checklist** com 6 itens (✓/✗ ao vivo):
   - Pelo menos 12 caracteres
   - Uma letra MAIÚSCULA
   - Uma letra minúscula
   - Um número
   - Um símbolo
   - Sem palavras óbvias (pibac, igreja, ano)
5. **Botão "Gerar senha pra mim"** (se `onGenerate` foi passado).
6. **Caixa educativa** explicando passphrase > "P@ssw0rd!" (se `showEducation=true`).
7. **Warning** do zxcvbn se houver (ex: "Senha comum em vazamentos").

**Test IDs que precisam continuar existindo (testes RTL):**
```
data-testid="password-strength"
data-testid="strength-label"
data-testid="strength-warning"         (só quando warning existe)
data-testid="strength-checklist"
data-testid="check-minLength"          data-ok="true|false"
data-testid="check-hasUpper"           data-ok="true|false"
data-testid="check-hasLower"           data-ok="true|false"
data-testid="check-hasNumber"          data-ok="true|false"
data-testid="check-hasSymbol"          data-ok="true|false"
data-testid="check-noContextWords"     data-ok="true|false"
data-testid="generate-password"        (só se onGenerate)
data-testid="education-box"            (só se showEducation)
role="progressbar" aria-valuenow=...
```

**Requisitos visuais pedidos:**
- Feedback instantâneo e satisfatório quando o usuário cruza cada checkpoint (animação sutil ao virar ✓)
- Não parecer "ameaçador" (evitar 💀, ⚠️ exagerado) — tom educativo
- Funcionar bem em tema claro e escuro (já tem variantes dark: no código)
- Acessível: contraste ≥ WCAG AA, foco visível nos botões

---

### 4.3. `<AvisoBanner>` — banner global de avisos (Phase 4)

**Status:** componente ainda não existe. Backend já tem os dados em `data/church.json`:

```ts
church.aviso = {
  ativo: boolean,
  severidade: 'info' | 'atencao' | 'urgente',
  mensagem: string,
  link: string | null,
  linkTexto: string | null,
}
```

**Comportamento funcional (a ser implementado junto com o design):**
- Renderiza APENAS se `aviso.ativo === true`
- Injetado em `app/layout.tsx` acima do `<Header>`
- Botão X pra fechar → persiste em `sessionStorage` (volta na próxima sessão)
- Sem banner ativo = zero espaço visual consumido

**Requisitos visuais pedidos:**
- Três variantes de cor/ícone por severidade:
  - `info` — azul calmo (`bg-accent/10`, ícone Info)
  - `atencao` — amarelo/âmbar (ícone AlertTriangle)
  - `urgente` — vermelho (`bg-destructive/10`, ícone AlertOctagon)
- Sticky no topo? Ou inline? (decisão do design)
- Responsive — texto pode ser longo; ellipsis + link "ler mais" no mobile
- Animação fade-in sutil ao aparecer

---

## 5. Design tokens existentes (Tailwind v4)

Usar estes em vez de cores hard-coded:

```
Cores semânticas
  bg-background    bg-card       bg-muted       bg-popover
  text-foreground  text-muted-foreground
  border-border    border-input
  ring-ring

Brand PIBAC
  bg-brand-gradient        (azul gradient do header)
  bg-brand-gradient-cyan   (variante mais clara)
  bg-brand-blue            (azul sólido)

Semântica de estado
  bg-primary / text-primary / text-primary-foreground
  bg-accent  / text-accent  (amarelo/dourado do branding)
  bg-destructive / text-destructive (vermelho)

Severidades (quando precisar)
  red-{50..900}, orange-{...}, yellow-{...}, green-{...}, emerald-{...}
```

**Fontes:**
- `font-serif` — títulos (visual mais formal, cabeçalhos de página)
- `font-sans` (default) — corpo

---

## 6. Exemplo mínimo de redesign

Se você quiser redesenhar `/admin/primeiro-acesso`, o esqueleto funcional que **tem que permanecer** é:

```tsx
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { evaluatePassword } from '@/lib/password-strength'
import { PasswordStrength } from '@/components/password-strength'

export default function Page() {
  const { user, loading, mustChangePassword, refreshProfile } = useAuth()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // Guards (middleware já cobre, mas evita flicker)
  if (loading) return <LoadingState />
  if (!user) { router.replace('/login'); return null }
  if (!mustChangePassword) { router.replace('/admin'); return null }

  const evaluation = evaluatePassword(password, [user.email ?? ''])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!evaluation.acceptable || password !== confirm) return
    if (!supabase) return
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    })
    if (error) { toast.error(error.message); return }
    await refreshProfile()
    router.replace('/admin')
  }

  return (
    <form onSubmit={onSubmit}>
      {/* ✨ seu design aqui ✨ */}
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <PasswordStrength
        password={password}
        userInputs={[user.email ?? '']}
        onGenerate={(gen) => { setPassword(gen); setConfirm(gen) }}
      />
      <input value={confirm} onChange={e => setConfirm(e.target.value)} />
      <button disabled={!evaluation.acceptable || password !== confirm}>
        Salvar
      </button>
    </form>
  )
}
```

Tudo que não está marcado como "tem que permanecer" é você.

---

## 7. Como testar uma mudança de design

```bash
npm run typecheck   # zero erros
npm test            # 32 passam
npm run build       # 16 rotas estáticas geradas
npm run dev         # smoke test manual
```

Se algum `data-testid` ou prop do `<PasswordStrength>` mudou, os testes em `__tests__/components/password-strength.test.tsx` precisam ser ajustados — **me avise** (backend-agent) que eu atualizo.

---

## 8. Roadmap de novos designs (futuro)

Conforme as fases avançam, o backend vai abrir tickets aqui com o que precisa de UI:

| Fase | UI nova prevista | Status |
|---|---|---|
| 3 | `/admin/primeiro-acesso`, `<PasswordStrength>` | **Aberto — §4.1, §4.2** |
| 4 | `<AvisoBanner>`, aba "Avisos" em `/admin` | Aberto — §4.3 (stub) |
| 5 | Calendário refatorado, lista de eventos, cards de ministérios | Pendente |
| 6 | Aba "Igreja" + "Pastor" em `/admin` (forms) | Pendente |
| 7 | Nada de UI — só SEO (metadata, sitemap, robots) | — |
| 8 | Login com recuperação de senha, UI pra admin convidar conteudistas | Pendente |

---

## 9. Como retomar

Em uma nova sessão pro Claude Design, cole:

> "Leia `SPECDESIGN.md`. Vou redesenhar `<pagina ou componente>`. Liste as restrições e hooks disponíveis, depois me mostre 2-3 variantes visuais. Não toque em `lib/`, `supabase/`, `middleware.ts`."
