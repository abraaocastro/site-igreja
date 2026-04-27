# PROGRESS — Estado atual do projeto PIBAC

> **Leia isto antes de começar qualquer tarefa nova.**
> Documento de handoff entre sessões. Evita refazer decisões já tomadas.
> Fonte canônica do "o que já foi feito vs. o que ainda falta".
>
> **Última atualização:** 2026-04-25 (Phase 7 entregue — SEO local)
> **SPEC correspondente:** [`SPEC.md`](./SPEC.md) v2.6
> **Design handoff:** [`SPECDESIGN.md`](./SPECDESIGN.md)
> **Fase em andamento:** **nenhuma** — todas as fases técnicas (1–4, 7, 8, 9) ✅ concluídas. Phases 5/6 fundidas em 8. Próximo: validação em produção + Search Console.
>
> ### ⚠️ Divisão de responsabilidade (desde 2026-04-23)
> - **Agente de código (backend-only):** auth, dados, RLS, hooks, lib, migrations, scripts, testes.
> - **Claude Design (frontend):** páginas, componentes visuais, estilos.
>
> Backend nunca mexe em JSX/CSS sem pedido explícito. Frontend nunca mexe em `lib/`, `supabase/`, `proxy.ts`, `scripts/` nem em `__tests__/`. O contrato vive em `SPECDESIGN.md`.

---

## 🎯 Próximos passos (atualizado 2026-04-25)

### 🔴 Bloqueio pra "site 100% pronto pro mundo"
1. **Rodar `supabase/migrations/003_cms_full.sql`** no SQL Editor do Supabase (cria a tabela `cms_historia` necessária pra Phase 9).
2. **Validar o CMS em produção** — entrar em `/admin`, testar todas as 9 abas (Visão Geral, Avisos, **Igreja**, **Pastor**, **História**, Banners, Ministérios, Eventos, Textos), salvar mudanças, ver aparecer no site público.
3. **Preencher conteúdo TODO via /admin → Igreja** (sem dev, agora):
   - Aba **Igreja → Contato → E-mail**: e-mail oficial da secretaria
   - Aba **Igreja → PIX → Chave**: chave PIX da tesouraria
   - Aba **Pastor → Foto/Bio**: foto/bio reais
4. **Trocar fotos Unsplash por fotos reais** via /admin → Banners/Ministérios/Eventos/História.

> Os campos de e-mail e PIX agora ficam no banco (`cms_textos` KV). `data/church.json` continua sendo o fallback estático/SSR mas o admin não precisa mais comitar JSON pra mudar.

### 🟡 Phase 7 — SEO local (próxima fase técnica)

Tudo **acrescenta**, sem reescrever nada do que já existe:
- `metadata` por página (title, description, Open Graph, Twitter Card) — atualmente só `app/layout.tsx` tem genérico
- `app/sitemap.ts` dinâmico (lê `data/church.json` + rotas estáticas)
- `app/robots.ts` (bloquear `/admin` e `/login` da indexação)
- Auditoria Lighthouse + correções de acessibilidade (alt text, contraste, labels)
- Submeter sitemap no Google Search Console (ação manual do stakeholder)

Estimativa: 1-2 sessões. Sem dependência de stakeholder além do Search Console no fim.

### 🟢 Resíduos da Phase 8 (não bloqueantes — fazer quando precisar)
- API route `/api/admin/invite-conteudista` pra admin convidar conteudistas pelo painel (hoje precisa rodar `bootstrap-admin` ou criar via Supabase Dashboard)
- UI de recuperação de senha por e-mail (Supabase tem nativo, falta tela)
- Server actions + `revalidatePath` (hoje é client-side; funciona, mas perde benefícios de SSR)
- Cleanup de imagens órfãs no bucket quando admin troca a foto

### 🔵 Design v1 → v2 nas páginas internas
Páginas que ainda usam o design "v1" (não receberam o redesign Fraunces de 2026-04-24): `/quem-somos`, `/historia`, `/visao`, `/pastor`, `/ministerios`, `/eventos`, `/calendario`, `/plano-leitura`, `/contribua`, `/contato`, `/login`, `/admin`. Header/Footer/SectionTitle já redesenhados, então a estética está consistente o suficiente; aplicar o redesign editorial nelas é trabalho do Claude Design quando houver tempo.

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
| `f471f14` | feat(phase-3): auth real com Supabase + first-login forçado + TDD | Migration profiles+RLS+trigger, supabase clients (browser/server/admin), useAuth refatorado, password-strength + componente, /admin/primeiro-acesso, middleware, bootstrap-admin script, vitest+RTL+jsdom (32 testes) |
| `8ba0706` | feat(design): aplicar redesign editorial do Claude Design | Fraunces + JetBrains Mono, tokens surface/surface-2/surface-3, radius 1rem, .display/.eyebrow/.card-soft/.btn-primary/.btn-ghost, command palette ⌘K, countdown próximo culto, marquee horários, footer wordmark Canaã |
| `c9b5c54` | feat(admin): senha padrão fixa + reset idempotente no bootstrap | `DEFAULT_ADMIN_PASSWORD = 'PibacAdmin@2026'`; rodar de novo reseta a senha + reativa must_change_password |
| `480cd11` | fix(bootstrap): parser de CRLF + upsert no profile | Tira `\r` antes do regex (`.env.local` salvo no Windows); troca `update` por `upsert` em `profiles` (cobre user criado antes da trigger existir) |
| `9a74ef5` | chore(next16): renomeia middleware.ts → proxy.ts | Convenção nova do Next 16 (mesmo runtime, só nome novo do arquivo + da função exportada) |
| `f289bd7` | feat(phase-4+8): avisos globais + CMS no Supabase | **Phase 4** — `<AvisoBanner>` (3 severidades, dispense via sessionStorage com chave por hash da mensagem, prop `forceOpen` pra preview), injetado em `app/layout.tsx` acima do `<Header>`, 12 testes RTL. **Phase 8** — migration 002 com 5 tabelas (`cms_banners`, `cms_ministerios`, `cms_eventos`, `cms_textos`, `cms_avisos`) + helper `is_cms_writer()` + RLS (público lê, writer escreve) + bucket `public-images` + seeds idempotentes. `lib/cms.ts` com readers/writers + `uploadImage`. Admin reescrito pra usar banco. Páginas públicas e AvisoBanner refatorados pra ler do banco com fallback nos defaults. **15 testes novos (59 totais).** Migration rodada manualmente no Supabase em 2026-04-25. |
| _pending_ | feat(phase-9): cobertura total do admin | Migration 003 com tabela `cms_historia` (timeline) + RLS + seeds. `lib/cms.ts` ganha CRUD de historia + `getChurchEffective()` que merge `cms_textos` KV em cima de `data/church.json` (campos: igreja/endereço/contato/social/pastor/pix/historia). 3 abas novas no /admin: **Igreja** (5 grupos: identidade/endereço/contato/social/pix), **Pastor** (foto + bio + identificação), **História** (textos + CRUD timeline). Páginas `/historia`, `/pastor`, `/contribua`, `/contato` e `<Footer>` refatorados pra usar o merger. Container "valor sugerido" removido de /contribua. **10 testes novos (69 totais).** |

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

### `proxy.ts` (root) — antigo `middleware.ts`
> Next.js 16 renomeou `middleware.ts → proxy.ts` e a função exportada `middleware → proxy`. Mesmo comportamento.

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
| `proxy.ts` | `createServerClient` — checa sessão em `/admin/*` |

---

## 8. Plano de fases (SPEC §5-6)

| Fase | Nome | Status | Entregue em |
|---|---|---|---|
| 1 | Fundação: `data/` + tipos + migração de hard-codes | ✅ Completa | `cec495d` + `aec9241` |
| 2 | Geolocalização (Maps embed, directions, search) | ✅ Completa | `cec495d` |
| 3 | Auth real com Supabase + TDD + primeiro-acesso forçado | ✅ Completa (login funcionando local+prod) | `f471f14` + `c9b5c54` + `480cd11` |
| ~ | Redesign editorial (fora de fase numerada) | ✅ Aplicado | `8ba0706` |
| ~ | Migração `middleware.ts → proxy.ts` (Next 16) | ✅ Aplicada | `9a74ef5` |
| 4 | Avisos globais (banner toggleável com severidade) | ✅ Completa | `f289bd7` |
| 5 | ~~Programação (eventos + horários consolidados)~~ | ☑️ **Fundida em Phase 8** (eventos vivem no banco) | — |
| 6 | ~~Admin UI pra editar JSON~~ | ☑️ **Fundida em Phases 8 + 9** (admin escreve direto no banco, com cobertura total) | — |
| **7** | **SEO completo (sitemap, robots, OG, rich results)** | ⏭️ **Próxima sugerida** — base JSON-LD já entregue | — |
| 8 | Backend CMS (Supabase tabelas + Storage + readers/writers) | ✅ Completa | `f289bd7` |
| 9 | Cobertura total do admin (Igreja/Pastor/História + remover sugestão de valor) | ✅ Completa | `39c5483` |
| **7** | **SEO local (metadata + sitemap + robots + a11y)** | ✅ Completa | _pending commit_ |

---

## 8.5. Phase 3 — concluído (2026-04-25)

Todos os passos manuais que o stakeholder precisava fazer foram executados:

- ✅ Migration `001_profiles_and_roles.sql` rodou no Supabase Dashboard
- ✅ `.env.local` preenchido com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- ✅ `npm run bootstrap:admin` rodou com sucesso → criou `dammabelmont@gmail.com` com `must_change_password: true`
- ✅ Login validado em `localhost:3000`
- ✅ Vercel: as 4 envs foram adicionadas em Project Settings → Environment Variables, redeploy disparado, login funcionando em `https://site-igreja-chi.vercel.app`

### 🔑 Login padrão (registrado em `scripts/bootstrap-admin.ts`)
- **email:** `dammabelmont@gmail.com`
- **senha:** `PibacAdmin@2026` (override via `ADMIN_PASSWORD=...`)
- Rodar `npm run bootstrap:admin` de novo **reseta** pra essa senha + reativa `must_change_password=true` (serve como "esqueci a senha").

### Lições aprendidas (consolidadas no script)
- `.env.local` salvo no Windows vem com CRLF. O parser inline foi corrigido pra remover `\r` antes do regex.
- Quando o user é criado **antes** da trigger `handle_new_user` existir, `update profiles` afeta 0 linhas silenciosamente. Trocamos por `upsert` pra cobrir esse caso.

---

## 9. Débitos técnicos conhecidos (baixa prioridade)

1. ~~**Credenciais inconsistentes**~~ → resolvido na Phase 3; `DEMO_USERS` não existe mais.
2. **`lib/data.ts`** ainda tem `heroBanners`, `inlineBanners`, `eventos`, `planoLeitura`, `horariosCultos` hardcoded. Migrar em Phases 5/8.
3. **Git CRLF warnings** ao commitar em Windows — cosmético, não bloqueia.
4. **Next build pula validação de tipos** (config default) — `npm run typecheck` é o gate correto antes de commitar.
5. ~~**Middleware file convention**~~ → resolvido em `9a74ef5` — `middleware.ts → proxy.ts`.
6. **1 vuln high severity no Next 16.0.0–16.2.2** (DoS em Server Components) — aguarda upstream patch; sem fix disponível na faixa 16.x atual.
7. **Senha padrão visível no repositório** (`PibacAdmin@2026` em `scripts/bootstrap-admin.ts`). É aceitável porque (a) só vive até o admin trocar, (b) o middleware força a troca no primeiro login, (c) o uso pretendido é "esqueci, reseta". Mas se mudar a postura de segurança, vale rotacionar.
8. **Lentidão do `npm run dev`** — Turbopack faz primeira compilação por rota. Esperado; não afeta produção (Vercel já vem pré-built).

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

## 10.5. O que está faltando (mapa de pendências)

### 🔴 Bloqueios para "site pronto pro mundo"

- **E-mail oficial da igreja** — `data/church.json#contato.email` ainda é TODO. Sem isso, `mailtoHref()` retorna null e o card de e-mail no `/contato` some.
- **Chave PIX real** — `data/church.json#pix.chave` é TODO. `/contribua` mostra "em configuração" no lugar do botão de copiar PIX.

### ✅ Phase 4 — Avisos banner (entregue 2026-04-25)

- `components/aviso-banner.tsx` com 3 severidades, dispense por sessionStorage (chave por hash da mensagem) + suporte a prop ad-hoc
- Injetado em `app/layout.tsx` acima do `<Header>`
- Aba "Avisos" em `/admin` com toggle, escolha de severidade, mensagem, link opcional, preview ao vivo
- 12 testes RTL (`__tests__/components/aviso-banner.test.tsx`)

### ✅ Phase 8 — CMS backend (entregue 2026-04-25)

- `supabase/migrations/002_cms_content.sql`: 5 tabelas (`cms_banners`, `cms_ministerios`, `cms_eventos`, `cms_textos` KV, `cms_avisos` singleton), helper `is_cms_writer()`, RLS (público lê, writer escreve), bucket Storage `public-images` (público), triggers `updated_at`, seeds idempotentes a partir de `lib/data.ts`
- `lib/cms.ts`: tipos camelCase, readers (`getBanners/Ministerios/Eventos/Textos/Aviso`) com fallback pros defaults se DB offline/vazio, writers (`upsert/create/delete` por entidade + `saveTextos`/`saveAviso`), `uploadImage(file)` pro bucket
- `app/admin/page.tsx`: reescrito — sem localStorage, lê e escreve no banco, upload de imagem com toast de progresso, refresh manual
- Páginas públicas (`/`, `/eventos`, `/calendario`, `/ministerios`) e `<AvisoBanner>`: leem do banco via `useEffect`, hidratam após primeira pintura
- 15 testes novos em `__tests__/lib/cms.test.ts` (mock chainable do builder Supabase) — total geral: **59 passando**
- **Manual setup necessário:** rodar `002_cms_content.sql` no SQL Editor (uma vez)

### ☑️ Phase 5 — fundida em Phase 8

Eventos/banners/ministérios/textos vivem no Supabase agora. `lib/data.ts`
ainda existe como defaults pro fallback (página renderiza mesmo se DB
estiver offline), mas não é mais a fonte de verdade em produção. Não
precisa mais migrar pra JSONs separados — o banco resolve.

### ☑️ Phase 6 — fundida em Phases 8 + 9

Admin escreve direto no banco com upload de imagem pro bucket. Phase 9
adicionou cobertura total (Igreja/Pastor/História). Não precisa mais
de export/import JSON manual nem diff visual — toda mudança é persistida
ao salvar.

### ✅ Phase 9 — Cobertura total do admin (entregue 2026-04-25)

- `supabase/migrations/003_cms_full.sql`: tabela `cms_historia` (timeline)
  + RLS + seeds idempotentes (8 marcos)
- `lib/cms.ts` ganha:
  - `CmsHistoriaEntry` + readers/writers (`getHistoria`, `createHistoria`,
    `upsertHistoria`, `deleteHistoria`)
  - **`getChurchEffective()`** — merger que pega defaults de
    `data/church.json` e sobrepõe overrides do KV `cms_textos`
    (igreja/endereço/contato/social/pastor/pix/historia)
  - Constante `CHURCH_TEXTOS_KEYS` mapeando os grupos
- 3 abas novas no `/admin`:
  - **Igreja** — 5 grupos (identidade/endereço/contato/social/pix) com sticky save bar
  - **Pastor** — foto com upload + nome/título/instagram + bio (textarea com contador de parágrafos)
  - **História** — textos da página (intro + citação) + CRUD da timeline
- Páginas refatoradas pra usar `getChurchEffective()`: `/historia`,
  `/pastor`, `/contribua`, `/contato`, `<Footer>`
- **Removido** o container "valores sugeridos" (R$ 25/50/100/200/500) de
  `/contribua` por feedback do stakeholder
- 10 testes novos em `__tests__/lib/cms.test.ts` — **69 totais**
- **Manual:** rodar `003_cms_full.sql` no SQL Editor uma vez

### ✅ Phase 7 — SEO local (entregue 2026-04-25)

- **Root metadata** (`app/layout.tsx`): title template `%s · Primeira Igreja Batista de Capim Grosso`, OG image, Twitter Card, canonical, robots permissivo, keywords, formatDetection (telefone/email/endereço)
- **Per-route `layout.tsx`** (12 rotas): cada uma com title/description/OG específicos. `/admin/*` e `/login` recebem `robots: { index: false, follow: false }`
- **`app/sitemap.ts`**: dinâmico, 11 URLs públicas com `priority` e `changeFrequency` razoáveis (home prioridade 1.0, eventos 0.9, calendário 0.7, etc.)
- **`app/robots.ts`**: permite tudo + `disallow` em `/admin/*` e `/login`. Aponta pro sitemap.
- **A11y essencial**: skip link no body (`<a href="#main-content">` que aparece só ao receber foco), form labels do `/contato` com `htmlFor`/`id` linkados + `autoComplete` apropriado
- JSON-LD `Church` mantido (já vinha de Phase 1)

**Pendências manuais (stakeholder):**
1. Submeter `https://site-igreja-chi.vercel.app/sitemap.xml` no [Google Search Console](https://search.google.com/search-console)
2. Rodar Lighthouse no Vercel/PageSpeed e ajustar conforme score

### 🟡 Resíduos da Phase 8 (não bloqueantes)

- API route `/api/admin/invite-conteudista` (admin convida via service_role)
- Recuperação de senha por e-mail (Supabase tem nativo, só precisa UI)
- Server actions + `revalidatePath` (hoje é tudo client-side)
- Cleanup de imagens órfãs no bucket quando admin troca a foto

### 🔵 UI / componentes novos pendentes (do `SPECDESIGN.md`)

- ~~`<AvisoBanner>`~~ → entregue (`components/aviso-banner.tsx`)
- Recovery password page — pendente
- Convite de conteudista (form `/admin/usuarios`) — pendente

### 🔵 Conteúdo (não-código, depende do stakeholder)

- E-mail oficial da secretaria
- Chave PIX da tesouraria
- Fotos reais dos ministérios (atualmente Unsplash)
- Foto adicional do pastor / fotos do templo / fotos de eventos (atualmente Unsplash)
- Bio mais longa do pastor (a atual é ok, 2 parágrafos)
- Hash dos cultos especiais (batismos, congressos) pra entrar em `eventos.especiais`

---

## 11. Como retomar

Em uma nova sessão, cole isto pro agente:

> "Leia `PROGRESS.md` primeiro. Depois me diga em que fase estamos e qual é o próximo passo da SPEC.md. Não me faça perguntas que já estão respondidas na seção 6 do PROGRESS."

Ou, mais curto:

> "Continue de onde paramos (ver `PROGRESS.md`)."
