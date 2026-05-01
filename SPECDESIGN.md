# SPECDESIGN — Handoff de UI pro Claude Design

> **Para quem lê:** este arquivo é o contrato entre o **backend** (mantido por agente automatizado) e o **frontend** (feito no Claude Design pelo humano).
>
> **Regra de divisão:**
> - **Backend** = dados, auth, RLS, middleware, helpers, hooks, testes, migrations, scripts.
> - **Frontend** = layout, cor, tipografia, espaçamento, microinterações, responsivo.
>
> Backend expõe APIs estáveis (tabela abaixo). Frontend consome e redesenha à vontade SEM mexer em `lib/`, `supabase/`, `middleware.ts`, `scripts/` ou `__tests__/`.

**Última atualização:** 2026-05-01 (Phase 10 frentes 10.1–10.4 entregues)
**SPEC correspondente:** [`SPEC.md`](./SPEC.md) v3.0
**PROGRESS:** [`PROGRESS.md`](./PROGRESS.md)

> **🎨 Changelog 2026-04-24:** recebido e aplicado redesign do Claude Design para:
> `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/banner-carousel.tsx`,
> `components/layout/header.tsx`, `components/layout/footer.tsx`, `components/section-title.tsx`.
>
> Mudanças-chave:
> - **Fontes novas:** Inter (sans) + **Fraunces** (serif editorial) + **JetBrains Mono** (números/eyebrow)
> - **Paleta mais calma:** `--background` passou a off-white `#FBFAF7` (leve tom quente), novos tokens `--surface`, `--surface-2`, `--surface-3`
> - **Raio maior:** `--radius: 1rem` (era 0.75rem) → linguagem mais moderna
> - **Novas utilities CSS:** `.display`, `.eyebrow`, `.card-soft`, `.btn-primary`, `.btn-ghost`, `.pulse-dot`, `.animate-marquee`, `.ph-stripes`, `.link-ul`, `.bg-grain`
> - **Header:** agora tem `⌘K` command palette + dropdowns com descrição + botão "Visite-nos"
> - **Home:** countdown pro próximo culto, marquee de horários, grid editorial com filtros de ministério
> - **Footer:** wordmark "Canaã" gigante de fundo + CTA "Há um assento esperando por você"
> - **BannerCarousel:** split text/image editorial + progress dashes + contador 01/04
>
> Backend logic preservado (useAuth/profile, logout async, password-strength contract, etc.).

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
lib/cms.ts                          Readers/writers + uploadImage do CMS
lib/password-strength.ts            evaluatePassword + generatePassphrase
lib/site-data.ts                    Reader de data/church.json + helpers
proxy.ts                            Guard de rota (Next 16; antes era middleware.ts)
scripts/bootstrap-admin.ts          CLI de bootstrap
supabase/migrations/*.sql           Schema do banco
__tests__/                          Testes TDD
data/church.json                    Dados canônicos institucionais (editar via PR)
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

### `lib/cms.ts` — conteúdo dinâmico (Phases 8 + 9)
```tsx
import {
  // Phase 8
  getBanners, getMinisterios, getEventos, getTextos, getAviso,
  upsertBanner, createBanner, deleteBanner,
  upsertMinisterio, createMinisterio, deleteMinisterio,
  upsertEvento, createEvento, deleteEvento,
  saveTextos, saveAviso,
  uploadImage,
  DEFAULT_TEXTOS,
  type CmsBanner, type CmsMinisterio, type CmsEvento, type CmsTextos,
  // Phase 9
  getHistoria, createHistoria, upsertHistoria, deleteHistoria,
  getChurchEffective,
  CHURCH_TEXTOS_KEYS,
  type CmsHistoriaEntry,
  // Phase 10
  getPlanoLeitura, createPlanoLeitura, upsertPlanoLeitura, deletePlanoLeitura,
  type CmsPlanoLeituraDay,
  type CmsMinisterioLeader,  // leaders agora é Array<{name, instagram}>
} from '@/lib/cms'

// Reader pattern (page.tsx — client component):
const [banners, setBanners] = useState<CmsBanner[]>([])
useEffect(() => { getBanners().then(setBanners) }, [])

// Church efetivo — defaults do JSON com overrides do KV cms_textos:
const [church, setChurch] = useState(() => getChurch())  // sync default
useEffect(() => { getChurchEffective().then(setChurch) }, [])

// Upload pattern:
const url = await uploadImage(file)  // <input type="file" />
```

Readers caem em **defaults estáticos** se DB estiver offline ou tabela vazia (página nunca quebra). Writers exigem login com role `admin` ou `conteudista` — RLS bloqueia anon.

`getChurchEffective()` retorna o `Church` completo já mesclado: defaults do
`data/church.json` com qualquer override que o admin tenha gravado em
`cms_textos`. Use em `/contato`, `/pastor`, `/contribua`, footer — qualquer
lugar que precise dos dados institucionais editáveis pelo admin.

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
| `/` | `app/page.tsx` | ✅ Redesign v2 (editorial) | — |
| `/quem-somos` | `app/quem-somos/page.tsx` | ⚠️ Design v1 (não recebeu o redesign de 04-24) | Opcional — alinhar com novos tokens |
| `/historia` | `app/historia/page.tsx` | ⚠️ Design v1 | Opcional |
| `/visao` | `app/visao/page.tsx` | ⚠️ Design v1 | Opcional |
| `/pastor` | `app/pastor/page.tsx` | ⚠️ Design v1 | Opcional |
| `/ministerios` | `app/ministerios/page.tsx` | ⚠️ Design v1 | Opcional |
| `/eventos` | `app/eventos/page.tsx` | ⚠️ Design v1 | Opcional |
| `/calendario` | `app/calendario/page.tsx` | ⚠️ Design v1 | Opcional |
| `/plano-leitura` | `app/plano-leitura/page.tsx` | ⚠️ Design v1 | Opcional |
| `/contribua` | `app/contribua/page.tsx` | ⚠️ Design v1 | Opcional |
| `/contato` | `app/contato/page.tsx` | ⚠️ Design v1 | Opcional |
| `/login` | `app/login/page.tsx` | ⚠️ Design v1 | Opcional |
| `/admin` | `app/admin/page.tsx` | ⚠️ Design v1 | Opcional |
| **`/admin/primeiro-acesso`** | `app/admin/primeiro-acesso/page.tsx` | ⚠️ **Funcional mas básico** | ✳️ **SIM** — ver §4.1 |

> **Nota:** o redesign de 2026-04-24 cobriu `/`, header, footer, banner-carousel e section-title. As páginas internas continuam no estilo v1 (mais formal, com Merriweather+SectionTitle decorativo). Como elas usam `<SectionTitle>` e `<Header>/<Footer>` já redesenhados, a estética está **consistente o suficiente**, só não foi reformulada editorialmente. Aplicar o redesign nas internas é trabalho de Phase futura ou pedido específico ao Claude Design.

### Componentes

| Componente | Arquivo | Status | Precisa do Claude Design? |
|---|---|---|---|
| Header | `components/layout/header.tsx` | ✅ Pronto | — |
| Footer | `components/layout/footer.tsx` | ✅ Pronto | — |
| Banner carousel | `components/banner-carousel.tsx` | ✅ Pronto | — |
| Section title | `components/section-title.tsx` | ✅ Pronto | — |
| **Password strength** | `components/password-strength.tsx` | ⚠️ **Funcional mas básico** | ✳️ **SIM** — ver §4.2 |
| Aviso banner | `components/aviso-banner.tsx` | ✅ Funcional (Phase 4) | Polish opcional — base usa tokens existentes |

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

### 4.3. `<AvisoBanner>` — banner global de avisos (Phase 4 — ✅ entregue 2026-04-25)

**Status:** componente funcional implementado (`components/aviso-banner.tsx`)
+ aba "Avisos" no `/admin` com toggle/severidade/preview ao vivo. 12 testes
RTL cobrindo visibilidade, dispensa, severidades, link interno/externo.
Polish visual é opcional — a base usa apenas tokens já existentes.

Schema dos dados em `data/church.json`:

```ts
church.aviso = {
  ativo: boolean,
  severidade: 'info' | 'atencao' | 'urgente',
  mensagem: string,
  link: string | null,
  linkTexto: string | null,
}
```

**Comportamento funcional (já implementado):**
- Renderiza APENAS se `aviso.ativo === true` E `mensagem.trim() !== ''`
- Injetado em `app/layout.tsx` acima do `<Header>`
- Botão X pra fechar → persiste em `sessionStorage`. **A chave inclui hash da mensagem**, então mudar o texto faz o banner reaparecer mesmo pra quem dispensou a versão anterior.
- Sem banner ativo = retorna `null` (zero espaço visual)
- Override pra preview do admin: `localStorage['pibac-cms-aviso']` sobrepõe o JSON. Component também aceita prop `aviso={...}` ad-hoc + `forceOpen` (desabilita dispensa, esconde X — usado no preview do `/admin`).

**Variantes visuais já implementadas (tokens):**
- `info` — `bg-accent/10` + ícone `<Info>` cor `text-accent`
- `atencao` — `bg-yellow-50` + borda `border-yellow-300` + ícone `<AlertTriangle>` (versão dark inclusa)
- `urgente` — `bg-destructive/10` + ícone `<AlertOctagon>` cor `text-destructive`. Recebe `aria-live="assertive"` (leitor de tela interrompe); demais usam `polite`.

**Test IDs (estáveis — testes RTL dependem):**
```
data-testid="aviso-banner"     data-severity="info|atencao|urgente"
data-testid="aviso-message"
data-testid="aviso-link"       (só quando `link` presente)
data-testid="aviso-dismiss"    (só quando NÃO `forceOpen`)
role="status" aria-live="polite|assertive"
```

**Polish opcional (Claude Design pode mexer):**
- Animação fade-in já tá com `animate-fade-in` do globals.css; pode trocar
- Sticky vs inline: hoje é inline (rola junto com a página). Sticky exige
  posicionar acima do `<Header>` que já é sticky — combinar antes de mexer
- Responsive em mobile: texto pode quebrar em várias linhas; se preferir
  truncar com `line-clamp` + "ler mais", abrir issue
- Ícone alternativo: hoje usa lucide-react; manter por consistência

---

## 5. Design tokens existentes (Tailwind v4 — redesign 2026-04-24)

Usar estes em vez de cores hard-coded:

```
Cores semânticas
  bg-background    #FBFAF7 off-white com toque areia (era #FFFFFF)
  bg-surface       #FFFFFF cards limpos
  bg-surface-2     #F4F2ED tom quente sutil (banda secundária)
  bg-surface-3     #E9E6DF tom quente mais marcado (terceiro nível)
  bg-card          #FFFFFF
  bg-muted         #F4F2ED (== surface-2)
  bg-popover       #FFFFFF
  text-foreground  #0B1020
  text-muted-foreground  #5A6478
  border-border    #E7E3DB
  ring-ring        #0A2973

Brand PIBAC
  bg-brand-gradient        (linear-gradient 160° navy → blue)
  bg-brand-gradient-cyan   (linear-gradient 135° blue → cyan)
  text-brand-gradient      (mesmo gradient em texto — para "palavras-chave")
  bg-brand-blue / text-brand-cyan / bg-brand-red

Semântica de estado
  bg-primary / text-primary / text-primary-foreground  (#0A2973)
  bg-accent  / text-accent  (#00C2FF cyan — highlights)
  bg-destructive / text-destructive (#FF2A2A vermelho)

Radius
  rounded-sm/md/lg/xl   (base = 1rem, antes era 0.75rem)
  rounded-2xl, rounded-3xl, rounded-full  — usados nos cards principais

Severidades (quando precisar)
  red-{50..900}, orange-{...}, yellow-{...}, green-{...}, emerald-{...}
```

**Fontes (importadas em `app/layout.tsx`):**
- `font-sans` (default) — **Inter**
- `font-serif` — **Fraunces** (variável, com SOFT axis) — títulos editoriais, usar via `.display`
- `font-mono` — **JetBrains Mono** — números, eyebrow/kicker, contadores

**Utilities CSS novas (em `globals.css`):**
```
.display           Serif grande com tracking -0.03em e line-height 0.98 (h1/h2/h3)
.eyebrow           Mono UPPERCASE 0.7rem com tracking 0.16em (kicker acima de títulos)
.card-soft         Superfície com borda + sombra animada no hover
.btn-primary       Pill 2.75rem, primary bg, translateY no hover
.btn-ghost         Pill transparente com borda, usa surface-2 no hover
.pulse-dot         Bolinha vermelha pulsante (status "ao vivo/próximo culto")
.animate-marquee   Scroll horizontal infinito (tickers de horários)
.animate-fade-in / .animate-fade-in-up / .animate-slide-in-left / .animate-pulse-soft
.hover-lift        Card que sobe sutil no hover
.ph-stripes        Placeholder listrado (quando não tem imagem)
.link-ul           Link com underline animado
.bg-grain          Textura sutil de ruído (superfícies grandes)
.glow-cyan         Box-shadow cyan (destaques)
.divider-brand     Linha horizontal cyan com fade nas pontas
```

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
| 3 | `/admin/primeiro-acesso`, `<PasswordStrength>` | **Aberto — §4.1, §4.2** (funcionais; polish opcional) |
| 4 | `<AvisoBanner>`, aba "Avisos" em `/admin` | ✅ **Entregue 2026-04-25** — funcional, polish opcional (§4.3) |
| 5 | Calendário refatorado, lista de eventos, cards de ministérios | Pendente |
| 6 | Aba "Igreja" + "Pastor" em `/admin` (forms) | Pendente |
| 7 | Nada de UI — só SEO (metadata, sitemap, robots) | — |
| 8 | Login com recuperação de senha, UI pra admin convidar conteudistas | Pendente |

---

## 9. Como retomar

Em uma nova sessão pro Claude Design, cole:

> "Leia `SPECDESIGN.md`. Vou redesenhar `<pagina ou componente>`. Liste as restrições e hooks disponíveis, depois me mostre 2-3 variantes visuais. Não toque em `lib/`, `supabase/`, `middleware.ts`."
