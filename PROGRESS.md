# PROGRESS — Estado atual do projeto PIBAC

> **Leia isto antes de começar qualquer tarefa nova.**
> Documento de handoff entre sessões. Evita refazer decisões já tomadas.
> Fonte canônica do "o que já foi feito vs. o que ainda falta".
>
> **Última atualização:** 2026-04-23
> **SPEC correspondente:** [`SPEC.md`](./SPEC.md) v2.1
> **Design handoff:** [`SPECDESIGN.md`](./SPECDESIGN.md)
> **Fase em andamento:** Phase 3 (Auth Supabase) — código pronto, pendente setup manual do stakeholder
>
> ### ⚠️ Divisão de responsabilidade (desde 2026-04-23)
> - **Agente de código (backend-only):** auth, dados, RLS, hooks, lib, migrations, scripts, testes.
> - **Claude Design (frontend):** páginas, componentes visuais, estilos.
>
> Backend nunca mexe em JSX/CSS sem pedido explícito. Frontend nunca mexe em `lib/`, `supabase/`, `middleware.ts`, `scripts/` nem em `__tests__/`. O contrato vive em `SPECDESIGN.md`.

---

## 0. Como usar este doc

Em sessões futuras, quando você (usuário) escrever algo como:

> _"prossiga com a fase 4"_ ou _"veja onde paramos"_

o agente deve:
1. **Ler `PROGRESS.md` primeiro** (este arquivo).
2. Depois ler `SPEC.md` se precisar de detalhes de fase.
3. **Não** refazer perguntas já respondidas (ver seção 6).
4. **Não** reimplementar o que já está marcado como ✅.

---

## 1. Stack e arquitetura (congelado)

| Item | Valor | Observação |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | React 19 |
| Styling | Tailwind CSS v4 | Design tokens: `bg-primary`, `text-accent`, `bg-brand-gradient` |
| **Auth** | **Supabase Auth** (cookies HTTP-only via `@supabase/ssr`) | Sessão compartilhada entre server/client/middleware |
| **DB** | **Supabase Postgres** | Tabela `profiles` com RLS; trigger autocria no signup |
| **Testes** | **Vitest + React Testing Library + jsdom** | `npm test` — 32 testes passando |
| Dados institucionais | `data/church.json` (canônico) | Import estático via `@/data/church.json` |
| Reader tipado | `lib/site-data.ts` | Expõe types + helpers (ver seção 3) |
| CMS admin conteúdo | `localStorage` (`pibac-cms-*`) | Preview local apenas; Phase 8 migra pra Supabase |
| Deploy | Vercel auto-deploy no push `main` | Repo: `github.com/abraaocastro/site-igreja` |
| Fluxo git | Push direto em `main`, sem PR | Divergente da SPEC §7, mas acordado |

**Pasta `src/` NÃO existe.** Código vive direto em `app/`, `components/`, `lib/`, `data/`, `supabase/`, `scripts/`, `__tests__/`.

---

## 2. Commits já pushados para `main`

| SHA | Título | O que entregou |
|---|---|---|
| `04ceff2` | Initial commit | Site Next.js inicial com dados fictícios |
| `7d0badf` | chore: ignore tsbuildinfo | - |
| `6f6f019` | feat(ui): logo maior + carousel sem setas | Header com logo 16→20, carousel drag-only com autoplay |
| `cec495d` | feat(phases-1-2): identidade canônica + geolocalização | Criou `data/church.json`, `lib/site-data.ts`, JSON-LD no layout, refactor de footer/contato/pastor/admin pra consumir JSON, Maps deep-links |
| `aec9241` | feat(phase-1): popular church.json com dados reais + ministérios com líderes | Respostas do questionário aplicadas; ministérios reais; infra PIX pronta (sem chave) |
| `2509b21` | docs: PROGRESS.md handoff | Documento inicial |
| _pending_ | feat(phase-3): auth real com Supabase + first-login forçado + TDD | Veja seção 8 |

---

## 3. API pública de `lib/site-data.ts`

Importar **sempre** daqui — nunca hard-code endereço/telefone/email em componente.

### Types exportados
```ts
Church                    // root
ChurchAddress             // rua, numero, bairro, cidade, estado, cep
ChurchContact             // telefone | null, whatsapp | null, email | null
ChurchSocial              // instagram, instagramPastor, instagramJovens, facebook|null, youtube|null
ChurchPastor              // nome, titulo, bio: string[], foto, instagram|null
ChurchPix                 // chave, tipo, titular
ChurchAviso               // ativo, severidade, mensagem, link|null, linkTexto|null
AvisoSeveridade           // 'info' | 'atencao' | 'urgente'
PixTipo                   // 'email' | 'cpf' | 'cnpj' | 'telefone' | 'aleatoria'
```

### Helpers disponíveis
```ts
getChurch(): Church                          // reader principal
isTodo(value): boolean                       // detecta placeholder "TODO-*"
safeValue(value, fallback='')                // retorna fallback se TODO/null
requireNonTodo(value, fieldName)             // crashea em prod se TODO

formatAddressOneLine(addr): string           // "Rua X, 30 - Bairro, Cidade - BA"
formatAddressTwoLines(addr): [l1, l2]        // para layout vertical
formatPhone(phone|null): string|null         // "(74) 99160-8059"
telHref(phone|null): string|null             // "tel:+5574..."
mailtoHref(email|null): string|null
whatsappHref(phone|null, msg?): string|null  // "https://wa.me/55... ?text=..."

getMapsQuery(): string                       // query URL-encoded com nome da igreja
getMapsEmbedUrl(): string                    // iframe src
getMapsSearchUrl(): string                   // botão "Abrir no Maps"
getMapsDirectionsUrl(): string               // botão "Como chegar"

hasPix(): boolean                            // true se pix.chave não é TODO
getChurchJsonLd(siteUrl?): Record            // Schema.org Church object
```

**Regra de ouro:** qualquer campo que pode ser TODO/null tem que cair em render condicional (`{link && ...}`) ou `safeValue`. Nada de `"TODO-email"` aparecendo pro usuário.

---

## 3.5. API pública do novo stack de Auth (Phase 3)

### `lib/auth.tsx` — `useAuth()` hook (API pública)
```ts
const {
  user,                // User | null  (objeto Supabase: id, email, user_metadata)
  profile,             // { id, email, nome, role: 'admin'|'conteudista' } | null
  loading,             // true até a primeira getSession resolver
  mustChangePassword,  // boolean — derivado de user_metadata.must_change_password
  login,               // (email, password) => Promise<{ ok, error? }>  (erros em PT-BR)
  logout,              // () => Promise<void>
  refreshProfile,      // () => Promise<void>  (após mudar nome/role)
} = useAuth()
```

### `lib/supabase/` — clientes
- **`client.ts`** → `createClient()`: browser, via `createBrowserClient`. Retorna `null` se envs faltarem (build-safe).
- **`server.ts`** → `createClient()`: async, pra server components/actions. Usa `cookies()` de `next/headers`.
- **`admin.ts`** → `createAdminClient()`: service_role. **Server-only.** Lança se env faltar.

### `lib/password-strength.ts` — avaliação + geração
```ts
evaluatePassword(password, userInputs?): {
  score: 0-4,
  strength: { label, color, percent },
  checklist: { minLength, hasUpper, hasLower, hasNumber, hasSymbol, noContextWords },
  crackTime: string,      // PT-BR: "3 horas", "séculos"
  warning: string,        // dica do zxcvbn
  acceptable: boolean,    // true só se tudo passa + score >= 3
  issues: string[],       // lista de problemas em PT-BR
}

generatePassphrase(): string   // sempre aceitável; formato "azul-Rubro-47-cafe-pomba#"

PASSWORD_MIN_LENGTH = 12
PASSWORD_MIN_SCORE = 3
```

### `components/password-strength.tsx`
```tsx
<PasswordStrength
  password={pw}
  userInputs={[email, nome]}  // opcional
  onGenerate={(gen) => setPw(gen)}  // opcional
  showEducation={true}  // default
/>
```

### `middleware.ts` (root)
- `/admin/*` sem sessão → `/login?next=<path>`
- `must_change_password: true` + rota `/admin/*` ≠ primeiro-acesso → força `/admin/primeiro-acesso`
- Já trocou a senha + rota = primeiro-acesso → manda pra `/admin`
- Matcher exclui `_next`, imagens estáticas

---

## 4. Estado dos dados em `data/church.json`

| Campo | Status | Valor |
|---|---|---|
| `nome` / `nomeCurto` / `slogan` | ✅ Real | — |
| `endereco.rua` / `numero` / `cep` | ✅ Real | Rua Eldorado, 30, 44695-000 |
| `endereco.bairro` | ✅ Real | **Novo Horizonte** |
| `endereco.cidade` / `estado` | ✅ Real | Capim Grosso / BA |
| `contato.telefone` | ✅ Definido | `null` — igreja **não tem** fixo |
| `contato.whatsapp` | ✅ Real | `+5574991608059` |
| `contato.email` | ⏳ TODO | Usuário deixou em branco no questionário |
| `social.instagram` | ✅ Real | `@pibaccapimgrosso` |
| `social.instagramPastor` | ✅ Real | `@prsilasbarreto` |
| `social.instagramJovens` | ✅ Real | `@rdjmbc` |
| `social.facebook` | ✅ Definido | `null` — não têm |
| `social.youtube` | ✅ Real | `youtube.com/@pibaccapimgrosso` |
| `pastor.nome` / `titulo` / `foto` | ✅ Real | Silas Barreto / Pastor Presidente / `/pastor-silas.png` |
| `pastor.bio` | ✅ Real | Array de 2 parágrafos (bio curta real) |
| `pastor.instagram` | ✅ Real | `@prsilasbarreto` |
| `pix.chave` | ⏳ TODO | Usuário pediu para **não** preencher ainda |
| `pix.tipo` | ✅ Placeholder | `"email"` (trocável quando chave chegar) |
| `pix.titular` | ✅ Real | "Primeira Igreja Batista de Capim Grosso" |
| `aviso.ativo` | ✅ Definido | `false` (Phase 4 vai usar isso) |

---

## 5. Estado dos ministérios (`lib/data.ts`)

Todos com líderes reais. `leaderInstagram` opcional — aparece no card de ministério como link quando existe.

| Ministério | Líder | Instagram |
|---|---|---|
| Louvor e Adoração | Lucas Barreto | [@lucasbarreto_0](https://www.instagram.com/lucasbarreto_0/) |
| Infantil | Luana | — |
| Jovens | Carla Emanuele | [@carlalpcastro](https://www.instagram.com/carlalpcastro/) |
| Mulheres | Sandra Barreto | — |
| Homens | Welder e Vitor | — |
| Missões | Dirleide Granja | — |

Nota: ainda vive em `lib/data.ts`. SPEC §4 prevê migração para `data/ministries.json` na Phase 5.

---

## 6. Perguntas que JÁ FORAM respondidas (não perguntar de novo)

| Pergunta | Resposta |
|---|---|
| Bairro da igreja? | **Novo Horizonte** |
| Telefone fixo? | **Não tem** (só WhatsApp) |
| WhatsApp? | **+55 74 99160-8059** |
| E-mail oficial? | **Ainda não têm** — deixar como TODO até receber |
| Instagram da igreja? | `@pibaccapimgrosso` |
| Instagram do pastor? | `@prsilasbarreto` |
| Instagram dos jovens? | `@rdjmbc` (RDJ) |
| Facebook? | **Não têm** |
| YouTube? | `youtube.com/@pibaccapimgrosso` |
| Bio do pastor? | _"Pastor Presidente da @pibaccapimgrosso. Advogado e Mestrando em Teologia."_ |
| Foto do pastor? | Manter `/pastor-silas.png` |
| Líderes dos ministérios? | Ver tabela seção 5 |
| Chave PIX real? | **Não colocar ainda** — infraestrutura pronta, esperar tesouraria |
| Dados bancários? | Não fornecidos — página mostra "em configuração" |
| Deploy exige PR? | **Não.** Push direto em `main` → Vercel auto-deploy |
| Google OAuth? | **Não** nesta fase — só e-mail/senha |
| Quantos admins? | **1 admin** (`dammabelmont@gmail.com`) que convida conteudistas |
| TDD? | **Sim** — Vitest + RTL configurado |
| Primeiro login? | **Forçar troca de senha** em `/admin/primeiro-acesso` com medidor zxcvbn |

---

## 7. Componentes que consomem `site-data` e `useAuth`

| Arquivo | O que consome |
|---|---|
| `app/layout.tsx` | `getChurchJsonLd()`, `<AuthProvider>` |
| `app/page.tsx` | `getChurch()`, `formatAddressOneLine()` |
| `app/contato/page.tsx` | Endereço, telefone, WhatsApp, email, socials, mapa |
| `app/pastor/page.tsx` | `pastor.bio`, `pastor.foto`, `pastor.instagram`, contato |
| `app/contribua/page.tsx` | `pix.chave` + `hasPix()` |
| `app/login/page.tsx` | `useAuth().login` |
| `app/admin/page.tsx` | `useAuth()`, `getChurch()` como fallback de textos |
| `app/admin/primeiro-acesso/page.tsx` | `useAuth()`, `supabase.auth.updateUser`, `<PasswordStrength>` |
| `components/layout/header.tsx` | `useAuth()` — menu de usuário |
| `components/layout/footer.tsx` | Endereço (Maps), telefone, WhatsApp, email, socials |
| `components/password-strength.tsx` | `evaluatePassword` + `generatePassphrase` |
| `middleware.ts` | `createServerClient` — checa sessão em `/admin/*` |

---

## 8. Plano de fases (SPEC §5-6)

| Fase | Nome | Status | Entregue em |
|---|---|---|---|
| 1 | Fundação: `data/` + tipos + migração de hard-codes | ✅ Completa | `cec495d` + `aec9241` |
| 2 | Geolocalização (Maps embed, directions, search) | ✅ Completa | `cec495d` |
| **3** | **Auth real com Supabase + TDD + primeiro-acesso forçado** | **✅ Código completo; pendente setup manual do usuário** | _pending commit_ |
| 4 | Avisos globais (banner toggleável com severidade) | ⏭️ **Próxima** | — |
| 5 | Programação (eventos + horários consolidados) | ⬜ Pendente | — |
| 6 | Admin UI pra editar JSON (via PR ou backend) | ⬜ Pendente | — |
| 7 | SEO completo (sitemap, robots, OG, rich results) | ⬜ Pendente | Base JSON-LD já entregue |
| 8 | Backend de conteúdo real (substitui localStorage) | ⬜ Pendente | — |

---

## 8.5. Phase 3 — o que o USUÁRIO ainda precisa fazer

Código completo, testes verdes, build passa. Mas pra auth **funcionar em produção**, três passos manuais:

### 1) Rodar a migration no Supabase
- Abrir https://app.supabase.com → projeto PIBAC → SQL Editor → New query
- Colar o conteúdo de `supabase/migrations/001_profiles_and_roles.sql`
- Run → verificar em Table Editor que `profiles` existe

### 2) Configurar envs em `.env.local`
Criar o arquivo na raiz (NUNCA commitar):
```
NEXT_PUBLIC_SUPABASE_URL=https://rlicinlfyavsrfnfqncu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_AShkGdIhygg6XmOOdZm8Hw_1WPWtq85
SUPABASE_SERVICE_ROLE_KEY=sb_secret_XXXXXX  ← pegar em Settings → API → service_role
```

### 3) Rodar o bootstrap
```
npm run bootstrap:admin
```
O script:
- Cria usuário `dammabelmont@gmail.com` com `must_change_password: true`
- Imprime a senha temporária no console
- Se o usuário já existe, só re-promove pra admin e reaplica a flag

### 4) Primeiro login
- `npm run dev`
- Abrir http://localhost:3000/login
- Entrar com o e-mail + senha temporária impressa no console
- Ser redirecionado pra `/admin/primeiro-acesso`
- Escolher senha forte (ou clicar "Gerar senha pra mim")
- Após salvar, vai pra `/admin`

### 5) Em produção (Vercel)
Adicionar as 3 envs em **Vercel → Project Settings → Environment Variables** (marcar "Production" para todas, e **NÃO** marcar "Expose to browser" na `SUPABASE_SERVICE_ROLE_KEY`).

---

## 9. Débitos técnicos conhecidos (baixa prioridade)

1. ~~**Credenciais inconsistentes**~~ → resolvido na Phase 3; `DEMO_USERS` não existe mais.
2. **`lib/data.ts`** ainda tem `heroBanners`, `inlineBanners`, `eventos`, `planoLeitura`, `horariosCultos` hardcoded. Migrar em Phases 5/8.
3. **Git CRLF warnings** ao commitar em Windows — cosmético, não bloqueia.
4. **Next build pula validação de tipos** (config default) — `npm run typecheck` é o gate correto antes de commitar.
5. **Middleware file convention** — Next 16 avisa que `middleware.ts` vai virar `proxy.ts` em versão futura. Migração trivial quando quebrar.
6. **1 vuln high severity no Next 16.0.0–16.2.2** (DoS em Server Components) — aguarda upstream patch; sem fix disponível na faixa 16.x atual.

---

## 10. Checklist de "definition of done" para qualquer fase nova

Antes de pushar:

- [ ] `npm run typecheck` sem erros
- [ ] `npm test` passa 100%
- [ ] `npm run build` passa
- [ ] Nenhum `TODO-*` visível em página renderizada
- [ ] Nenhum valor hard-coded que deveria estar em `data/church.json`
- [ ] Componentes novos consomem `site-data.ts` e/ou `useAuth`, não strings literais
- [ ] Se a fase tocou em auth/secrets: zero `NEXT_PUBLIC_` em vars sensíveis
- [ ] Commit message segue convenção `feat(phase-N): descricao curta`
- [ ] `PROGRESS.md` atualizado com o que mudou (seções 2 e 8)

---

## 11. Como retomar

Em uma nova sessão, cole isto pro agente:

> "Leia `PROGRESS.md` primeiro. Depois me diga em que fase estamos e qual é o próximo passo da SPEC.md. Não me faça perguntas que já estão respondidas na seção 6 do PROGRESS."

Ou, mais curto:

> "Continue de onde paramos (ver `PROGRESS.md`)."
