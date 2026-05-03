# SPECDESIGN — Handoff de UI pro Claude Design

> **Para quem lê:** este arquivo é o contrato entre o **backend** (mantido por agente automatizado) e o **frontend** (feito no Claude Design pelo humano).
>
> **Regra de divisão:**
> - **Backend** = dados, auth, RLS, middleware, helpers, hooks, testes, migrations, scripts.
> - **Frontend** = layout, cor, tipografia, espaçamento, microinterações, responsivo.
>
> Backend expõe APIs estáveis (tabela abaixo). Frontend consome e redesenha à vontade SEM mexer em `lib/`, `supabase/`, `middleware.ts`, `scripts/` ou `__tests__/`.

**Última atualização:** 2026-05-03 (Redesign v3 completo — todas as entregas v3.1–v3.5)
**SPEC correspondente:** [`SPEC.md`](./SPEC.md) v3.2
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

## 3. Redesign v3 — Plano visual por página

> **Referência:** `Home_v2.html` (entregue 2026-05-02)
> **Direção estética:** Editorial magazine light — Fraunces serif display, JetBrains Mono eyebrows, Inter body. Paleta quente off-white (#FBFAF7) com navy (#0A2973) e cyan (#00C2FF) como destaques. Cards com radius 22-28px, botões pill (radius 999px). Hover lifts com sombra. Gradients sutis. Grain texture em superfícies escuras.
>
> **Princípio mobile-first:** a maioria dos visitantes acessa pelo celular. Cada seção tem breakpoint specs explícitos.

### Mudanças globais (afetam todas as páginas)

| Artefato | O que muda |
|---|---|
| `styles/globals.css` | Tokens reescritos de oklch → hex brand. Novas utilities (.display, .eyebrow, .btn-primary pill, .btn-ghost pill, .pulse-dot, .schedule-strip, etc). `--background: #FBFAF7`, `--foreground: #0B1020`, `--surface: #FFF`, `--surface-2: #F4F2ED`, `--surface-3: #E9E6DF`, `--primary: #0A2973`, `--accent: #00C2FF`, `--destructive: #FF2A2A`, `--border: #E7E3DB`. Radius base 1rem. |
| `app/layout.tsx` | Google Fonts → Inter + Fraunces (opsz variable) + JetBrains Mono. font-sans/serif/mono mapping. |
| `components/layout/header.tsx` | Sticky glass-effect (backdrop-blur). Brand mark "C" com glow conic. Nav links pill hover. ⌘K command palette. Mobile drawer full-screen com numeração /01 /02. Botão "Visite-nos" pill. |
| `components/layout/footer.tsx` | Dark bg (foreground). CTA "Há um assento esperando por você" com Fraunces italic + accent em "assento". 4 colunas de links. Wordmark "Canaã" gigante (5-20vw, opacity 5%). Bottom bar com CNPJ + cidade. |

### Página por página

| # | Rota | Status atual | Plano de redesign v3 | Prioridade |
|---|---|---|---|---|
| 1 | `/` (Home) | v2 editorial (escuro, carrossel) | **Reescrever inteira.** Hero: título Fraunces clamp(56px,9vw,132px) esquerda + countdown card (navy gradient, grain) direita. Sem carrossel — card estático mostra próximo evento do CMS. Marquee strip (foreground bg, faixa preta pill com scroll infinito). Welcome: grid 5/7 sticky left + pilares 4-col. Pastor: seção com bg surface-2 + retrato 4:5 com name card. Ministérios: grid 3-col com filtro rail pill. Eventos: seção escura (foreground bg) com lista editorial (data grande + título + meta). Duo: 2 cards (plano leitura dark + contribua light). Versículo: full-bleed escuro com Fraunces italic gigante. Visit CTA: card com mapa placeholder + info rows. | 🔴 |
| 2 | `/quem-somos` | v1 genérico | Hero editorial com título Fraunces + eyebrow "— Quem somos". Grid de valores (pilares). Timeline resumida. CTA para /historia. | 🟡 |
| 3 | `/historia` | v1 + timeline do CMS | Manter timeline funcional. Redesenhar: eyebrow + título Fraunces. Cards da timeline com ano grande (Fraunces), foto radius 22px, descrição. Citação bíblica em bloco accent. | 🟡 |
| 4 | `/visao` | v1 genérico | Layout editorial 2-col: missão/visão/propósito em cards com ícone e numeração mono. Versículo de destaque em bloco full-width escuro. | 🟡 |
| 5 | `/pastor` | v1 + foto do CMS | Seção hero com retrato 4:5 (border-radius 28px, sombra), tag "Pastor presidente" com pulse-dot. Grid 5/7 com bio. Quote block com borda accent. CTAs pill. | 🟡 |
| 6 | `/ministerios` | v1 + leaders popover | Grid 3-col com filter rail pill (categorias). Cards: imagem 4:3 com numeração mono + badge categoria. Body: nome Fraunces + descrição + leaders. Hover lift + arrow rotate. | 🟡 |
| 7 | `/eventos` | v1 + lista do CMS | Seção escura (como na home). Lista editorial: data grande (dia Fraunces + mês mono) + título + descrição + meta (horário/local) + arrow. Filtro por categoria. | 🟡 |
| 8 | `/calendario` | v1 + react-day-picker | Manter calendário funcional. Redesenhar header com eyebrow + título Fraunces. Cards de eventos do dia selecionado com novo estilo. | 🟢 |
| 9 | `/plano-leitura` | v1 + progresso localStorage | Card escuro (navy gradient) como hero com progresso. Grid de dias com checked state. Animação de confetti/celebrate ao completar. | 🟢 |
| 10 | `/contribua` | v1 + PIX do CMS | Card light com ícone PIX grid pattern. Chave copiável com feedback. Informações bancárias. CTA para contato. | 🟢 |
| 11 | `/contato` | v1 + formulário real (11.1) | Card split: mapa/foto esquerda + formulário direita. Info rows (endereço/cultos/contato) como na visit section da home. Botão WhatsApp verde. | 🟢 |
| 12 | `/login` | v1 funcional | Layout centralizado limpo. Logo + card de login com sombra. Link "Esqueceu a senha?" (preparar pra 11.3). | 🟢 |
| 13 | `/admin` | funcional, tokens atuais | Não redesenhar na v3 — é interno. Manter tokens atualizados para consistência mínima. | ⚪ |
| 14 | `/admin/primeiro-acesso` | funcional, básico | Mesmo que /login — layout centralizado limpo. | ⚪ |

### Ordem de implementação

1. **globals.css** — tokens + utilities (base pra tudo)
2. **header.tsx** — afeta todas as páginas
3. **footer.tsx** — afeta todas as páginas
4. **Home** (`app/page.tsx` + `components/banner-carousel.tsx` removido) — vitrine principal
5. Páginas internas em lote (quem-somos → historia → visao → pastor → ministerios → eventos)
6. Páginas secundárias (calendario → plano-leitura → contribua → contato → login)

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

## 8. Roadmap de redesign v3

| Entrega | Escopo | Status |
|---|---|---|
| v3.1 | `globals.css` tokens + utilities | ✅ Entregue |
| v3.2 | `header.tsx` + `footer.tsx` | ✅ Entregue |
| v3.3 | Home (`app/page.tsx`) — hero editorial + countdown card + marquee + seções | ✅ Entregue (+ 3 fixes: mobile, logo, contraste) |
| v3.4 | Páginas internas: quem-somos, historia, visao, pastor, ministerios, eventos | ✅ Entregue |
| v3.5 | Páginas secundárias: plano-leitura, contribua, contato + fix footer dark mode | ✅ Entregue |
| — | Calendário, login, admin | ⚪ Não incluídos (funcionais com tokens atualizados) |

---

## 9. Como retomar

Em uma nova sessão pro Claude Design, cole:

> "Leia `SPECDESIGN.md`. Vou redesenhar `<pagina ou componente>`. Liste as restrições e hooks disponíveis, depois me mostre 2-3 variantes visuais. Não toque em `lib/`, `supabase/`, `middleware.ts`."
