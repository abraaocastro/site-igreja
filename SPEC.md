# SPEC — Portal Institucional PIBAC

**Versão:** 2.9 (2026-04-28)
**Status:** Phases 1–4, 7, 8, 9 ✅ concluídas. **Phase 10** (refinos do admin) **em execução** — escopo agora com **9 frentes**: 5 originais (convite users, calendar preview, plano leitura, multi-líderes, HelpHints) + 4 bugs reportados pelo stakeholder (10.6 contador inteligente, 10.7 botão Assistir configurável, 10.8 marquee de eventos da semana, 10.9 UUID de banner aparecendo no eyebrow). HelpHint pronto, dev notes removidos.
**Substitui:** v2.3 de 25/04/2026

---

## 0. Contexto real do projeto (leitura de estado)

Antes de qualquer spec, o que existe hoje no repositório:

| Item | Estado atual | Observação |
|---|---|---|
| Stack | Next.js 16 App Router + Tailwind v4 | **Não há `src/`** — código vive direto em `app/`, `components/`, `lib/` |
| Dados institucionais | **Hard-coded em múltiplos arquivos** | Endereço duplicado em `app/contato/page.tsx` e `components/layout/footer.tsx` |
| CMS | `/admin` baseado em **localStorage** (prefixo `pibac-cms-*`) | Pessoal por navegador, não compartilha equipe |
| Dados fictícios | Endereço "Rua Principal, 123" • Tel "(74) 99999-9999" • Email genérico • Socials `facebook.com`/`instagram.com`/`youtube.com` • Líderes fictícios | Precisa substituição total |
| Auth | Client-side demo via `NEXT_PUBLIC_ADMIN_*` | Não atende a spec se admin passar a gerenciar dados sensíveis |
| Deploy | Vercel via `gh repo create` já configurado | Repositório: `abraaocastro/site-igreja` |

**Decisão de arquitetura:** arquivo JSON-like em `data/` + tipos em `lib/site-data.ts` + imports estáticos. Funciona em build, é versionável em git, admin poderá editar via PR ou futuro backend. O localStorage-CMS permanece como **preview pessoal** pra textos e banners (Phase 7 migra pra backend real).

---

## 1. Gaps do spec v1.3 que esta versão resolve

| Gap v1.3 | Correção v2.0 |
|---|---|
| Fala `/src/data/` | Projeto não tem `src/`. Usa-se `data/` no root. |
| Não menciona localStorage CMS | Explicita convivência: JSON = fonte oficial, localStorage = preview por dispositivo |
| "Cor" livre em avisos | Severidade **enum** (`info`, `atencao`, `urgente`) → cores derivadas do design system |
| Sem ordem de execução | Fases P0→P6 ordenadas por valor |
| Sem critérios de aceite | Cada fase tem checklist testável |
| Telefone/email oficiais não fornecidos | Listado em **Questões em aberto** |
| Bairro não confirmado | Listado em **Questões em aberto** |
| Onde ficam botões de social | Definido por fase |
| Horários oficiais de culto divergentes | Consolidar em Phase 4 |

---

## 2. Questões em aberto (preciso das respostas pra fases 1 e 2)

- [ ] **Bairro** da Rua Eldorado, 30 (a spec marcou "[A definir / Centro]")
- [ ] **Telefone** oficial de contato (WhatsApp e/ou fixo)
- [ ] **E-mail** oficial da secretaria
- [ ] **Facebook** oficial (se não tiver, removo o ícone)
- [ ] **YouTube** oficial (idem)
- [ ] **Horário preciso** dos cultos — hoje há duas versões no código (footer diz 9h e 19h domingo; `lib/data.ts` diz EBD 9h + culto 19h)
- [ ] **Bio do Pr. Silas Barreto** oficial (atual é placeholder)
- [ ] **Foto oficial** do pastor (hoje uso `public/pastor-silas.png` — mantém?)
- [ ] **Dados dos ministérios**: líder real de cada um + perfil de Instagram (se houver)

Enquanto não houver resposta, Phase 1 deixa **TODO markers** explícitos nos campos (ex: `"telefone": "+5574TODO"`) e o build falha se tentar renderizar um TODO em produção — evita "rua principal 123" sair pro ar.

---

## 3. Objetivos finais (v2.0)

1. **Centralização:** toda informação institucional em 3 arquivos JSON.
2. **Controle:** admin edita sem tocar em componente React.
3. **Geolocalização:** rotas diretas via Google Maps em 1 clique.
4. **Avisos:** banner global toggleável com severidade.
5. **SEO local:** rankeável para "igreja batista Capim Grosso".
6. **Sem regressão:** painel `/admin` atual continua funcionando.

---

## 4. Arquitetura de dados (canônica)

```
data/
  church.json        # Identidade, endereço, contato, socials, pastor, avisos
  events.json        # Eventos recorrentes + especiais
  ministries.json    # Ministérios com liderança e socials

lib/
  site-data.ts       # Reader tipado com validação (import estático)
  data.ts            # DEPRECATED — migrado pra JSONs em fases 1 e 4
```

### `data/church.json` (Phase 1)

```json
{
  "nome": "Primeira Igreja Batista de Capim Grosso",
  "nomeCurto": "PIBAC",
  "slogan": "Uma comunidade de fé, amor e esperança",

  "endereco": {
    "rua": "Rua Eldorado",
    "numero": "30",
    "bairro": "TODO-bairro",
    "cidade": "Capim Grosso",
    "estado": "BA",
    "cep": "44695-000"
  },

  "contato": {
    "telefone": "+5574TODO",
    "whatsapp": "+5574TODO",
    "email": "TODO@TODO.com.br"
  },

  "social": {
    "instagram": "https://www.instagram.com/pibaccapimgrosso/",
    "instagramPastor": "https://www.instagram.com/prsilasbarreto/",
    "instagramJovens": "https://www.instagram.com/rdjmbc/",
    "facebook": null,
    "youtube": null
  },

  "pastor": {
    "nome": "Silas Barreto",
    "titulo": "Pastor Presidente",
    "bio": "TODO-bio-oficial",
    "foto": "/pastor-silas.png",
    "instagram": "https://www.instagram.com/prsilasbarreto/"
  },

  "aviso": {
    "ativo": false,
    "severidade": "info",
    "mensagem": "",
    "link": null,
    "linkTexto": null
  }
}
```

### `data/events.json` (Phase 4)

```json
{
  "recorrentes": [
    { "id": "ebd", "titulo": "Escola Bíblica Dominical", "diaSemana": 0, "hora": "09:00", "local": "Templo Principal", "categoria": "culto" },
    { "id": "culto-dom", "titulo": "Culto de Celebração", "diaSemana": 0, "hora": "19:00", "local": "Templo Principal", "categoria": "culto" },
    { "id": "oracao", "titulo": "Culto de Oração", "diaSemana": 3, "hora": "19:30", "local": "Templo Principal", "categoria": "oracao" },
    { "id": "jovens", "titulo": "Encontro de Jovens", "diaSemana": 6, "hora": "19:30", "local": "Salão dos Jovens", "categoria": "jovens" }
  ],
  "especiais": [
    { "id": "evt-1", "titulo": "…", "data": "2026-05-03", "hora": "18:00", "local": "…", "categoria": "batismo", "descricao": "…", "imageUrl": "…" }
  ]
}
```

### `data/ministries.json` (Phase 4)

```json
[
  {
    "id": "louvor",
    "nome": "Louvor e Adoração",
    "descricao": "…",
    "imageUrl": "…",
    "icon": "Music",
    "lider": "TODO",
    "instagram": null
  }
]
```

---

## 5. Fases (ordem canônica)

Cada fase é fechada: PR único, build passa, acceptance checklist 100% marcado.
Não começar fase N+1 com pendência da fase N.

### Phase 1 — Foundation: identidade + endereço oficial **(P0, em execução)**
Objetivo: zero dados fictícios visíveis. Endereço oficial, socials oficiais (Instagram), pastor em todos os lugares.

**Tasks**
- 1.1. Criar `data/church.json` com schema acima
- 1.2. Criar `lib/site-data.ts` com tipos + helper `getChurch()`
- 1.3. Refatorar `components/layout/footer.tsx` pra consumir `getChurch()`
- 1.4. Refatorar `app/contato/page.tsx` pra consumir `getChurch()`
- 1.5. Substituir ícones Instagram placeholder pelos 3 perfis oficiais (Igreja / Pastor / Jovens)
- 1.6. Remover Facebook/YouTube do footer e `/contato` se ainda não houver conta oficial (evita link quebrado)
- 1.7. Atualizar `app/pastor/page.tsx` pra ler dados do `church.json`
- 1.8. Adicionar validação no `lib/site-data.ts`: `throw` se algum campo começar com `TODO`

**Acceptance**
- [ ] Build passa
- [ ] `grep -r "Rua Principal"` retorna 0 resultados
- [ ] `grep -r "99999-9999"` retorna 0 resultados (ou marcado como TODO)
- [ ] Instagram da igreja, pastor e jovens funcionais em todas as páginas
- [ ] Endereço real só existe em `data/church.json` (fonte única)

**Fora de escopo**
- Backend real (Phase 7)
- Mapa interativo (Phase 2)

---

### Phase 2 — Geolocalização: Google Maps + rotas
Objetivo: visitante abre rotas do celular em 1 toque.

**Tasks**
- 2.1. Helper `getMapsSearchUrl()` em `lib/site-data.ts` que monta `https://www.google.com/maps/search/?api=1&query=<endereco-encoded>`
- 2.2. Helper `getMapsDirectionsUrl()` que monta `https://www.google.com/maps/dir/?api=1&destination=<…>`
- 2.3. Substituir iframe mockado de `/contato` pelo endereço real (URL do embed)
- 2.4. Botão primário "Como chegar" em `/contato` que abre rotas em nova aba
- 2.5. Botão secundário "Abrir no Maps" no footer (mobile-first)
- 2.6. Schema.org `PostalAddress` no JSON-LD (base pra Phase 6)

**Acceptance**
- [ ] Clicar "Como chegar" no iPhone abre o app nativo de Maps com destino preenchido
- [ ] Clicar "Como chegar" no Android idem
- [ ] Desktop abre Google Maps web em nova aba
- [ ] Iframe do mapa carrega em < 2.5s (lazy load)

---

### Phase 3 — Auth real com Supabase **(P0, implementada)**
Objetivo: substituir o mock `NEXT_PUBLIC_ADMIN_*` por auth real com sessão
em cookies HTTP-only, RLS, role-based access e **forçar troca de senha no
primeiro login**. Mantém a API pública do `useAuth()` intacta.

**Decisões**
- E-mail/senha (sem Google OAuth nesta fase — decidido pelo stakeholder)
- 1 admin bootstrapado via script (`dammabelmont@gmail.com`); admin
  convida conteudistas via API route (Phase 3.5 futura)
- Primeiro login força `/admin/primeiro-acesso` com medidor de força
  (`zxcvbn-ts` em PT-BR) + gerador EFF-style de passphrase
- TDD: Vitest + React Testing Library + jsdom

**Tasks**
- 3.1. Instalar deps: `@supabase/ssr`, `@supabase/supabase-js`,
  `@zxcvbn-ts/{core,language-common,language-pt-br}`, `vitest`, `@vitejs/plugin-react`,
  `@testing-library/{react,jest-dom,user-event}`, `jsdom`, `tsx`, `dotenv`
- 3.2. Migration SQL `supabase/migrations/001_profiles_and_roles.sql`:
  - Enum `user_role` (admin/conteudista)
  - Tabela `profiles` (FK → `auth.users`, email, nome, role)
  - Trigger `handle_new_user` — autocria profile no signup
  - Trigger `handle_updated_at`
  - RLS: self-read, self-update, admin-read-all, admin-update-all
- 3.3. Clientes Supabase em `lib/supabase/{client,server,admin}.ts`
  - Browser: `createBrowserClient` via `@supabase/ssr`
  - Server: `createServerClient` com cookies de `next/headers`
  - Admin: `service_role` — nunca `NEXT_PUBLIC_`
- 3.4. Reescrever `lib/auth.tsx` mantendo API pública do `useAuth()`:
  - Supabase Auth por baixo, profile lido de `public.profiles`
  - Expõe `mustChangePassword` derivado de `user_metadata`
  - Degrada graciosamente se envs ausentes (build passa sem `.env.local`)
- 3.5. `middleware.ts` (defense in depth):
  - `/admin/*` sem sessão → `/login?next=<path>`
  - `must_change_password: true` → força `/admin/primeiro-acesso`
  - Mantém cookies de sessão renovados
- 3.6. `lib/password-strength.ts`:
  - `evaluatePassword()` — score 0-4 + checklist + crack time em PT-BR
  - `generatePassphrase()` — EFF-style, sempre score ≥ 3, formato
    `palavra-Palavra-##-palavra-palavra#`
  - Dicionário PT-BR + 10 palavras do contexto PIBAC (pibac, igreja, etc)
- 3.7. `components/password-strength.tsx` — medidor visual + checklist
  ao vivo + botão "Gerar senha pra mim" + caixa educativa
- 3.8. `/admin/primeiro-acesso` — form de troca forçada da senha,
  usando o componente acima + `supabase.auth.updateUser`
- 3.9. `scripts/bootstrap-admin.ts` — CLI idempotente que usa
  `service_role` pra criar admin com `must_change_password: true`
- 3.10. TDD — `__tests__/lib/password-strength.test.ts`,
  `__tests__/lib/auth.test.tsx`, `__tests__/components/password-strength.test.tsx`
- 3.11. Remover `DEMO_USERS`, atualizar consumidores (`header.tsx`,
  `admin/page.tsx`) pra shape novo (`profile?.nome` em vez de `user.name`)

**Acceptance**
- [x] `npx tsc --noEmit` passa
- [x] `npm test` passa (32/32 atualmente)
- [x] `npm run build` passa (inclui prerender das 16 rotas)
- [x] Middleware bloqueia `/admin` sem sessão → `/login?next=/admin`
- [x] Cobertura TDD das regras de senha (checklist, acceptable, gerador)
- [x] Usuário rodou SQL migration no dashboard Supabase (2026-04-25)
- [x] Usuário preencheu `.env.local` com service_role
- [x] Usuário rodou `npm run bootstrap:admin` com sucesso
- [x] Login funcionando em `localhost:3000` + `site-igreja-chi.vercel.app` (envs configuradas no Vercel)
- [x] Bootstrap idempotente: rodar de novo reseta a senha pra padrão `PibacAdmin@2026` e reaplica `must_change_password`
- [x] Convenção `middleware.ts` migrada pra `proxy.ts` (Next 16)

**Notas pós-implementação (2026-04-25)**
- `scripts/bootstrap-admin.ts` recebeu duas correções: parser de `.env.local` agora trata CRLF (Windows), e a inserção em `profiles` virou `upsert` (cobre o caso de usuário criado antes de a trigger existir).
- Senha padrão definida em código: `PibacAdmin@2026` (atende ao checklist; só vive até o usuário trocar). Override via env `ADMIN_PASSWORD=…`.

**Fora de escopo desta fase**
- Admin criar conteudistas via UI (Phase 3.5 futura)
- Recuperação de senha por e-mail (Phase 3.6 futura)
- Upload de foto de perfil

---

### Phase 4 — Aviso global ✅ (concluída 2026-04-25)
Objetivo: admin ativa banner no topo de todas as páginas em < 1 minuto.

**Tasks**
- [x] 4.1. Estender `church.json` com `aviso: { ativo, severidade, mensagem, link, linkTexto }` (já existia desde Phase 1)
- [x] 4.2. `components/aviso-banner.tsx` que renderiza apenas se `aviso.ativo === true` E `mensagem` não-vazia
- [x] 4.3. Severidades com tokens do design system:
  - `info` → `bg-accent/10` + ícone `<Info>` `text-accent`
  - `atencao` → `bg-yellow-50` + borda `border-yellow-300` + ícone `<AlertTriangle>` (variantes dark inclusas)
  - `urgente` → `bg-destructive/10` + ícone `<AlertOctagon>` `text-destructive`, com `aria-live="assertive"`
- [x] 4.4. Botão X pra dispensar → persiste em `sessionStorage` com **chave por hash da mensagem** (mudou texto = banner reaparece)
- [x] 4.5. Injetado em `app/layout.tsx` acima do `<Header>`
- [x] 4.6. Aba "Avisos" no `/admin` com toggle, escolha de severidade, mensagem+link e **preview ao vivo** (renderiza o próprio `<AvisoBanner>` em modo `forceOpen`)

**Acceptance**
- [x] Setar `aviso.ativo = true` em `church.json` → banner aparece em TODAS as páginas após deploy (verificado via `npm run build` — todas as 16 rotas regeradas)
- [x] Cor/ícone mudam conforme severidade (data-attribute + estilos diferentes em snapshot)
- [x] Usuário fecha → não reaparece na mesma sessão (sessionStorage)
- [x] Sem banner, zero espaço visual consumido (component retorna `null`)
- [x] TDD: 12 testes RTL cobrindo visibilidade, dispensa, severidades, link interno/externo, preview controlado

**Cobertura de testes (`__tests__/components/aviso-banner.test.tsx`)**
- não renderiza se `ativo=false` ou `mensagem` vazia
- renderiza mensagem quando ativo
- aplica `data-severity` correto pra cada severidade
- `aria-live="assertive"` só em `urgente`, `polite` nas outras
- link interno (sem `target=_blank`) vs externo (com `target` + `rel`)
- clicar em fechar persiste em sessionStorage e some da tela
- mudar a mensagem reseta dispensa (chave por hash)
- `forceOpen` ignora dispensa e esconde botão X (modo preview do admin)

---

### Phase 5 — Programação consolidada (era Phase 4 em v2.0)
Objetivo: eventos recorrentes vivem em um lugar, aparecem corretamente no calendário e lista.

**Tasks**
- 5.1. Criar `data/events.json` com `recorrentes` + `especiais`
- 5.2. Helper `getEventsForMonth(year, month)` que expande recorrentes pra cada semana
- 5.3. Refatorar `app/calendario/page.tsx` pra usar helper (ler do JSON, localStorage apenas como override)
- 5.4. Refatorar `app/eventos/page.tsx` idem
- 5.5. Criar `data/ministries.json` com estrutura sugerida
- 5.6. Migrar `lib/data.ts` → JSONs, deprecar constants antigas
- 5.7. Atualizar `/admin` pra ler/editar `ministries.json` e `events.json`

**Acceptance**
- [ ] EBD de domingo aparece em todos os domingos do calendário
- [ ] Evento especial de 03/05 aparece só naquele dia
- [ ] Editar ministério no admin reflete via localStorage (preview) sem quebrar a leitura do JSON
- [ ] `lib/data.ts` não é mais importado em nenhum componente

---

### Phase 6 — Admin UI expandido (era Phase 5)
Objetivo: leigo edita tudo sem mexer no git.

**Tasks**
- 6.1. Aba "Igreja" no `/admin` com formulários pra endereço, contato, socials
- 6.2. Aba "Pastor" com nome, bio, foto (upload → base64 preview)
- 6.3. Export JSON pra download (admin baixa o church.json editado, envia pra dev commitar)
- 6.4. Import JSON pra restaurar
- 6.5. Diff visual "Current vs Local override" pra deixar claro o que mudou

**Acceptance**
- [ ] Admin edita endereço, baixa `church.json`, commitamos, deploy mostra mudança
- [ ] Import JSON funciona
- [ ] Nada é enviado pra servidor (ainda) — só localStorage + download

---

### Phase 7 — SEO local ✅ (concluída 2026-04-25)
Objetivo: top 3 no Google pra "igreja batista Capim Grosso".

**Tasks**
- [x] 7.1. `metadata` por rota: `app/<route>/layout.tsx` (server component) com title/description/OG/Twitter/canonical específicos. Páginas seguem como `'use client'` pra hidratar do CMS, mas o layout ao redor injeta a metadata. Title template `%s · Primeira Igreja Batista de Capim Grosso` no root.
- [x] 7.2. JSON-LD `Church` no `app/layout.tsx` (já vinha de Phase 1 via `getChurchJsonLd()`). Mantido.
- [x] 7.3. `app/sitemap.ts` dinâmico — 11 rotas públicas com `priority` e `changeFrequency` razoáveis. `/admin` e `/login` ficam de fora.
- [x] 7.4. `app/robots.ts` permite tudo + `disallow` em `/admin/*` e `/login`. Aponta pro `/sitemap.xml`.
- [x] 7.5. A11y essencial: skip link no root layout, form labels do `/contato` linkados via `htmlFor`/`id`, `autoComplete` nos inputs. Restante (Lighthouse audit e tweaks finos) pode ser feito após o site receber tráfego real.
- [ ] 7.6. **Manual:** submeter `https://site-igreja-chi.vercel.app/sitemap.xml` no [Google Search Console](https://search.google.com/search-console).

**Acceptance**
- [x] `/sitemap.xml` gerado e válido (11 URLs)
- [x] `/robots.txt` gerado, bloqueia `/admin` e `/login`
- [x] `/admin/*` e `/login` retornam `noindex,nofollow` via metadata
- [x] Title template aplica a todas as 12 páginas internas
- [x] OG image + Twitter Card no root
- [x] Skip link funcional ao tab + form labels acessíveis
- [ ] Submeter ao Search Console (passo manual do stakeholder)
- [ ] Lighthouse audit pós-deploy (passo manual)

**Pendências do stakeholder (manuais)**
1. Acessar https://search.google.com/search-console
2. Adicionar a propriedade `https://site-igreja-chi.vercel.app` (ou domínio próprio quando registrar)
3. Verificar (Vercel já adiciona um meta tag automaticamente se você colar o token)
4. Em "Sitemaps", submeter `sitemap.xml`
5. Aguardar a indexação rolar (24-72h pra primeiras impressões)

---

### Phase 8 — Backend de conteúdo ✅ (concluída 2026-04-25)
Objetivo: tirar conteúdo do localStorage e jogar pra Supabase, pra que toda
edição do admin apareça pra todo mundo, em qualquer dispositivo.

**Tasks**
- [x] 8.1. Migration `002_cms_content.sql`:
  - 5 tabelas: `cms_banners`, `cms_ministerios`, `cms_eventos`, `cms_textos` (KV), `cms_avisos` (singleton id=1)
  - Helper `is_cms_writer()` que checa role do `profiles`
  - RLS: select público (anon+authenticated), CRUD só pra `is_cms_writer()`
  - Bucket Storage `public-images` com RLS (leitura pública, escrita só de writer)
  - Triggers de `updated_at` em todas as tabelas
  - Seeds idempotentes a partir do que vivia em `lib/data.ts`
- [x] 8.2. `lib/cms.ts`: tipos camelCase, readers (`getBanners`, `getMinisterios`, `getEventos`, `getTextos`, `getAviso`), writers (`upsertBanner`, `createBanner`, `deleteBanner`, idem ministerio/evento, `saveTextos`, `saveAviso`) e `uploadImage(file)` pro bucket
- [x] 8.3. Refactor `app/admin/page.tsx`: usa writers + reader real, com loading state, sem localStorage. Upload de imagem com toast de progresso.
- [x] 8.4. Refactor páginas públicas (`/`, `/eventos`, `/calendario`, `/ministerios`) pra ler dos readers via `useEffect`. Mantém defaults estáticos pra evitar flash vazio enquanto rede responde.
- [x] 8.5. `<AvisoBanner>` lê de `getAviso()` no client-side; admin publica → todo mundo vê
- [x] 8.6. TDD `__tests__/lib/cms.test.ts` — 15 testes cobrindo fallback (cliente null/erro/vazio), mapeamento snake_case→camelCase, writers (insert/update/delete/upsert), upload de imagem (path sanitizado + getPublicUrl)

**Acceptance**
- [x] `npm run typecheck` passa
- [x] `npm test` passa (59/59)
- [x] `npm run build` passa (16 rotas)
- [x] Admin edita banner/ministério/evento/texto/aviso → salva no banco → outros visitantes veem na próxima carga, em qualquer navegador
- [x] Upload de imagem grava no bucket `public-images` e retorna URL pública usada nos cards
- [x] RLS bloqueia escrita anônima (testado via mock)
- [x] Páginas públicas funcionam mesmo se Supabase estiver offline (fallback pros defaults de `lib/data.ts`)

**Pendências em aberto**
- API route `/api/admin/invite-conteudista` pra admin criar conteudistas pelo painel
- Recuperação de senha por e-mail (Supabase tem nativo, só precisa UI)
- Server actions + `revalidatePath` (hoje é tudo client-side; funciona bem porque RLS protege)
- Cleanup de imagens órfãs no bucket quando admin troca a foto

**Manual setup necessário (uma vez)**
1. **Rodar `supabase/migrations/002_cms_content.sql`** no SQL Editor do Supabase Dashboard
2. Verificar que o bucket `public-images` foi criado em **Storage** e está marcado como público
3. Redeploy automático do Vercel já pega as mudanças de código

---

### Phase 9 — Cobertura total do admin ✅ (concluída 2026-04-25)
Objetivo: admin edita TODA informação do site sem depender de dev. Inclui
endereço, contato, redes sociais, PIX, dados do pastor (nome/foto/bio) e a
linha do tempo da página /história. Também remove o card de "valores
sugeridos" em /contribua (não combina com tom de igreja).

**Tasks**
- [x] 9.1. Migration `003_cms_full.sql`:
  - Tabela `cms_historia` (timeline) com RLS + trigger `updated_at`
  - Seeds idempotentes da timeline original (8 marcos de 1970 a "Hoje")
  - Documenta as novas chaves do `cms_textos` (KV) que admin pode preencher
- [x] 9.2. `lib/cms.ts` ganha:
  - Type `CmsHistoriaEntry` + readers/writers da timeline
  - `getChurchEffective()` — merger que pega defaults de `data/church.json` e sobrepõe overrides do `cms_textos` KV (campos `igrejaNome`, `enderecoRua`, `pastorBio`, `pixChave` etc.)
  - Constante `CHURCH_TEXTOS_KEYS` mapeando os grupos pra reuso na UI
- [x] 9.3. Refactor páginas:
  - `/historia` → client component que lê timeline do banco + textos via `getTextos()`
  - `/pastor` → usa `getChurchEffective()` (mostra nome/foto/bio editáveis)
  - `/contribua` → usa `getChurchEffective()` para PIX **e remove o container de valores rápidos** (R$ 25/50/100/200/500)
  - `/contato` → usa `getChurchEffective()`
  - `<Footer>` vira client component pra também respeitar overrides
- [x] 9.4. `/admin` ganha 3 abas novas:
  - **Igreja** — endereço, contato (telefone/whatsapp/email), redes sociais, PIX (5 grupos com sticky save bar)
  - **Pastor** — nome, título, instagram, foto (com upload), bio (textarea com contador de parágrafos)
  - **História** — textos da página (intro + citação) + CRUD da timeline (reusa CardsEditor)
- [x] 9.5. Tests: 10 novos em `__tests__/lib/cms.test.ts` cobrindo historia readers/writers + getChurchEffective merger (defaults, overrides, valores vazios, "null" literal)

**Acceptance**
- [x] `npm run typecheck` passa
- [x] `npm test` passa (69/69)
- [x] `npm run build` passa (16 rotas)
- [x] Admin edita endereço/PIX/foto-do-pastor/bio → todos os visitantes veem na próxima carga
- [x] Container "Valor sugerido" sumiu de /contribua
- [x] Ainda funciona offline (fallback pros defaults de `data/church.json`)

**Manual setup necessário (uma vez)**
1. **Rodar `supabase/migrations/003_cms_full.sql`** no SQL Editor do Supabase
2. Conferir que `cms_historia` aparece em Table Editor
3. Vercel redeploia automaticamente no push

---

### Phase 10 — Refinos do admin (em execução, 2026-04-26)
Objetivo: cobrir as últimas lacunas do painel pra que o admin não dependa
do dev pra nada do dia-a-dia. Cinco frentes independentes:

#### 10.1. Convite de novos usuários (admin → conteudista)
- Nova aba **`Usuários`** em `/admin`, **visível apenas pra `role='admin'`** (filtro client-side baseado em `useAuth().profile.role`; backend reforça via service-role policy)
- Form simples: e-mail + nome → POST em `/api/admin/users` (route handler server-side)
- Server action usa `createAdminClient()` (service_role) pra:
  1. `auth.admin.createUser({ email, password: random, email_confirm: true, user_metadata: { nome, must_change_password: true } })`
  2. Promover via `update profiles set role = 'conteudista'` se necessário (a trigger já cria com 'conteudista' por padrão, então normalmente é no-op)
- Listar usuários existentes (join `auth.users` ↔ `profiles`) com role + último login
- Permitir **revogar acesso**: `auth.admin.deleteUser(id)` (com confirm dialog)
- **Hierarquia:** conteudista vê todas as abas EXCETO `Usuários`. Admin vê tudo.
- A senha gerada é exibida UMA VEZ no console + na tela de sucesso pro admin compartilhar com o convidado, que será forçado a trocar via fluxo `/admin/primeiro-acesso` já existente.

#### 10.2. Calendar preview no EventosEditor
- Mini-calendário (mês atual + nav de mês) renderizado dentro da aba `Eventos`, no topo da lista de eventos
- Dias com eventos ganham um **dot colorido** (cor por categoria)
- Clicar num dia filtra a lista pra mostrar só eventos daquele dia
- Reaproveita lógica de `app/calendario/page.tsx` (já existe `parseLocalDate`, etc.) — extrair pra `lib/calendar-utils.ts`
- Componente novo: `components/admin/calendar-preview.tsx`

#### 10.3. Plano de leitura editável
- Migration: `cms_plano_leitura (id uuid, dia int, livro text, capitulos text, tema text, sort_order int, created_at, updated_at)` com RLS no padrão dos outros (`is_cms_writer` escreve, anon lê)
- Seed inicial a partir de `lib/data.ts#planoLeitura` (30 dias, Gênesis → Provérbios) via `WHERE NOT EXISTS`
- `lib/cms.ts` ganha `getPlanoLeitura()`, `createPlanoLeitura()`, `upsertPlanoLeitura()`, `deletePlanoLeitura()` + tipo `CmsPlanoLeituraDay`
- Nova aba `Plano de Leitura` no admin com CRUD via `CardsEditor` (mesmo pattern de banners/eventos/historia)
- Refactor `app/plano-leitura/page.tsx` pra ler do DB com fallback aos defaults estáticos
- Defaults removidos do `lib/data.ts` (ou mantidos só pro fallback como nos demais)

#### 10.4. Múltiplos líderes por ministério
- Schema: substituir colunas `leader text` + `leader_instagram text` em `cms_ministerios` por `leaders jsonb` no formato `[{ "name": "Lucas Barreto", "instagram": "https://..." }, ...]`
- Migration faz **backfill**: linha existente vira array de 1 elemento com os dados antigos. Drop das colunas antigas só depois do backfill confirmado.
- `lib/cms.ts`: `CmsMinisterio.leaders: Array<{ name: string; instagram: string | null }>`. Mantém compat lendo o array; se vier vazio cai pros defaults.
- `MinisteriosEditor` no admin: lista dinâmica de líderes com botão `+ adicionar líder` e `×` por linha. Cada linha tem campos `nome` + `instagram` (opcional).
- Frontend (`/ministerios` e card da home):
  - Se 1 líder: mostra inline como hoje
  - Se 2+ líderes: botão **"Liderança (N)"** que abre um popover (`<Popover>` simples, não modal) listando todos os nomes + ícones de Instagram clicáveis
- Componente novo: `components/leaders-popover.tsx`

#### 10.5. Notas dev → HelpHint icons
- Componente `components/help-hint.tsx` (`?` circular + popover, fecha com Esc/click outside) — **já criado**
- Remover as caixas "Como funciona" embutidas (eram pra mim, dev — cliente não precisa daquela explicação técnica)
- Adicionar `HelpHint` ao lado de cada **título de aba** com texto curto e prático (ex: "Aviso ativo aparece no topo de todas as páginas. Mude a mensagem e ele reaparece pra quem já dispensou.")
- Idem ao lado de campos não-óbvios (ex: `sortOrder`, `link interno vs externo`, `chave PIX`)
- Tom: orientação curta pro usuário final, sem jargão técnico

**Tasks (em ordem)**
- [x] 10.5.a — `components/help-hint.tsx` criado
- [x] 10.5.b — Remover as 2 caixas "Como funciona" do admin (overview + IgrejaEditor)
- [x] 10.5.c — `CardsEditor` ganhou prop `help` opcional (renderiza `<HelpHint>` ao lado do título)
- [ ] 10.5.d — Passar `help` em cada uso de `CardsEditor` (Banners, Ministérios, Eventos, História)
- [ ] 10.5.e — Adicionar `<HelpHint>` em IgrejaEditor, PastorEditor, AvisosEditor, TextosEditor
- [ ] 10.4.a — Migration 004: `leaders jsonb` em `cms_ministerios` + backfill + drop antigas
- [ ] 10.4.b — `lib/cms` types + readers + writers atualizados
- [ ] 10.4.c — `MinisteriosEditor`: lista dinâmica de líderes com `+`/`×`
- [ ] 10.4.d — `components/leaders-popover.tsx` + uso em `/ministerios` e card da home
- [ ] 10.3.a — Migration 004 (mesmo arquivo): `cms_plano_leitura` + RLS + seeds
- [ ] 10.3.b — `lib/cms` adiciona getters/setters do plano de leitura
- [ ] 10.3.c — Aba `Plano de Leitura` no admin via `CardsEditor`
- [ ] 10.3.d — Refactor `app/plano-leitura/page.tsx` pra ler do DB
- [ ] 10.2.a — Extrair `parseLocalDate` etc. pra `lib/calendar-utils.ts`
- [ ] 10.2.b — `components/admin/calendar-preview.tsx`
- [ ] 10.2.c — Inserir no topo do `EventosEditor` com filtro por dia
- [ ] 10.1.a — `app/api/admin/users/route.ts` (POST cria, GET lista, DELETE revoga) usando `createAdminClient`
- [ ] 10.1.b — Nova aba `Usuários` no admin, gated por `profile.role === 'admin'`
- [ ] 10.1.c — Form de convite + lista de usuários + botão revogar
- [ ] 10.1.d — Tela de sucesso mostra senha gerada uma única vez
- [ ] Tests: cobertura mínima dos novos readers/writers + role gating
- [ ] Verificação: typecheck + tests + build
- [ ] Atualizar SPEC.md/PROGRESS.md/SPECDESIGN.md

**Acceptance**
- [ ] Admin (`dammabelmont@gmail.com`) vê 11 abas no painel; conteudista convidado vê 10 (sem `Usuários`)
- [ ] Conteudista convidado loga com a senha gerada → cai em `/admin/primeiro-acesso` → escolhe nova senha → entra no painel sem aba Usuários
- [ ] Calendário no EventosEditor destaca dias com eventos. Clicar filtra.
- [ ] `/plano-leitura` lê do DB. Editar dia 5 no admin → reflete no site.
- [ ] Editar ministério "Homens" pra ter Welder + Vitor → frontend mostra "Liderança (2)". Clicar abre popover com os 2 nomes + Instagrams.
- [ ] Cliques no `?` ao lado de cada aba abrem balão explicativo curto e claro pra leigo.

**Manual setup**
1. Rodar `supabase/migrations/004_*.sql` no SQL Editor (cobre 10.3 + 10.4)
2. (Opcional) Vercel: nada novo de env — service_role já está configurado da Phase 3

#### 10.6. Contador "Próximo culto" inteligente (bug do usuário, 2026-04-28)

**Sintoma reportado:** admin cadastrou evento pra hoje 28/04/2026 às 19:30
(eram 19:03). Contador continuou marcando ~5 dias / 23 horas, ignorando
o evento iminente.

**Causa raiz:** `useNextService()` em `app/page.tsx` é **hardcoded** pra
calcular "próximo domingo às 19h":

```ts
const daysToSunday = (7 - now.getDay()) % 7
next.setDate(now.getDate() + daysToSunday)
next.setHours(19, 0, 0, 0)
```

Ignora completamente `cms_eventos` e os horários recorrentes em
`horariosCultos` (que tem Qua 19:30, Sáb 19:30 também). Resultado: o
contador é decorativo, não funcional.

**Fix proposto:**
- Renomear `useNextService()` → `useNextEvent()`
- Combinar 2 fontes:
  - **Recorrentes** (de `cms_textos` ou nova tabela `cms_horarios_cultos`):
    expandir cada entrada (`Domingo 09:00`, `Domingo 19:00`, `Quarta 19:30`, `Sábado 19:30`)
    pras próximas N ocorrências (calcular datetime real)
  - **Especiais** (de `cms_eventos`): pegar todos cuja `date+time` >= now
- Sortear todos por datetime ascendente
- Pegar o primeiro
- Se o evento for nas próximas 24h, mostrar título do evento ao invés de "PRÓXIMO CULTO"

**Tasks**
- [ ] 10.6.a — Migração de `lib/data.ts#horariosCultos` pra tabela `cms_horarios` ou `cms_textos` KV (cada linha vira `horarioDom1`, `horarioDom2`, etc.) — decidir formato no momento de implementar
- [ ] 10.6.b — Helper `lib/next-event.ts` que combina recorrentes + eventos especiais e retorna o `Date` do mais próximo, junto com `title`
- [ ] 10.6.c — Refatorar `useNextService()` em `app/page.tsx` pra usar o helper
- [ ] 10.6.d — Mostrar título do evento (ex: "Culto de Celebração", "Batismo") em vez de "PRÓXIMO CULTO" quando faltar < 24h
- [ ] 10.6.e — Tests unitários do helper cobrindo: nenhum evento, só recorrente, só especial, ambos, evento iminente, evento já passou

#### 10.7. Botão "Assistir" configurável (link do YouTube/Live)

**Hoje:** botão hardcoded `<Link href="/eventos">` em `app/page.tsx`. Não dá pro
admin apontar pra live do YouTube ou outra URL externa sem mexer no código.

**Fix proposto:**
- Adicionar 2 chaves novas em `cms_textos`: `botaoAssistirUrl` e `botaoAssistirRotulo`
- Defaults: `/eventos` e `Assistir`
- Quando URL é externa (começa com `http`), abrir em nova aba (`target="_blank" rel="noreferrer"`)
- Aba **Igreja → Marca** (ou nova subseção "Hero") no admin tem campos pra editar
- Bonus: campo "ao vivo agora?" — quando ligado, botão fica `bg-destructive` com pulse animado pra chamar atenção

**Tasks**
- [ ] 10.7.a — Adicionar `botaoAssistirUrl`, `botaoAssistirRotulo`, `botaoAssistirAoVivo` em `CHURCH_TEXTOS_KEYS`
- [ ] 10.7.b — `app/page.tsx`: ler do CMS via `getTextos()` e renderizar o link com target dinâmico
- [ ] 10.7.c — Subseção "Botão Assistir" no IgrejaEditor (ou nova aba "Home/Hero")
- [ ] 10.7.d — Tratamento visual: animação pulse + cor destrutive quando `aoVivo === true`

#### 10.8. Marquee de horários — eventos da semana atual + remover ícone Sparkles

**Sintoma:** marquee mostra os 4 horários recorrentes em loop infinito
(`[...horariosCultos, ...horariosCultos]`), sem filtrar:
- Eventos que **já passaram** nessa semana (ex: hoje é quinta — deveria ocultar
  o "Quarta 19:30")
- Eventos só desta **semana corrente** — não tem noção de "essa semana"

E o ícone `<Sparkles className="text-accent" />` (✨) que parece "IA generated".

**Fix proposto:**
- Substituir loop estático por: **expandir** os horários recorrentes pras
  ocorrências reais da semana corrente (segunda 00:00 → domingo 23:59) +
  juntar com `cms_eventos` da semana
- Filtrar `datetime > now`
- Sortear ascendente
- Se a lista vier curta (ex: domingo 22h, só sobrou nada), o marquee pode
  mostrar uma linha "Sem mais eventos esta semana — veja todos em /eventos"
- Trocar `<Sparkles>` por `<Calendar>` ou ícone neutro (ou remover o ícone
  e usar só um bullet `•`)
- Reaproveitar o helper `lib/next-event.ts` da 10.6 (mesma lógica de
  expandir recorrentes)

**Tasks**
- [ ] 10.8.a — Helper `lib/week-events.ts` (ou export do mesmo `next-event.ts`)
  que retorna lista de eventos pendentes da semana corrente, ordenados
- [ ] 10.8.b — Refatorar marquee em `app/page.tsx` pra consumir o helper
- [ ] 10.8.c — Substituir `<Sparkles>` por `<Calendar className="h-3.5 w-3.5 text-accent" />` (ou remover totalmente, mantendo só bullet)
- [ ] 10.8.d — Estado vazio: "Sem mais eventos esta semana"

#### 10.9. Pré-headline editável nos banners (bug visual reportado 28/04)

**Sintoma reportado:** o eyebrow do banner mostra coisa tipo
`03 · AA147C07-8C6B-4EDE-90B2-7320198AD875` em cima do título "Escola
Bíblica Dominical". Visualmente terrível.

**Causa raiz:** em `components/banner-carousel.tsx` linha 64:

```tsx
<div className="eyebrow mb-4">
  {String(idx + 1).padStart(2, '0')} · {banner.id.toUpperCase()}
</div>
```

O eyebrow concatena `índice` + `banner.id`. Antes da Phase 8, `id` era
string curta (ex: `"hero-1"`, `"culto"`). Depois da migração pro CMS,
`id` virou UUID gerado pelo Supabase (`gen_random_uuid()`). O UUID
"vazou" pro design.

**Fix proposto:**
- Adicionar coluna `pre_headline text` (nullable) em `cms_banners`
- Tipo `CmsBanner.preHeadline: string | null`
- Admin tem novo campo **"Pré-headline (opcional)"** no `BannersEditor`,
  antes do campo "Título" — limite ~50 chars
- Frontend (`<BannerCarousel>`):
  - Se `preHeadline` preenchida → renderiza eyebrow com esse texto
  - Se vazia/null → **não renderiza o eyebrow** (em vez de mostrar UUID)
  - O número sequencial `01/03/04` fica só no contador inferior direito do hero (que já tem `01/04` no canto da imagem) — sai do topo do título

**Tasks**
- [ ] 10.9.a — Migration 004 (ou nova): `alter table cms_banners add column pre_headline text;`
- [ ] 10.9.b — Atualizar `CmsBanner` type, mapeadores `bannerFromRow`/`bannerToRow`, `DEFAULT_BANNERS` em `lib/cms.ts`
- [ ] 10.9.c — `components/banner-carousel.tsx`: substituir eyebrow concatenado por:
  ```tsx
  {banner.preHeadline && (
    <div className="eyebrow mb-4">{banner.preHeadline}</div>
  )}
  ```
- [ ] 10.9.d — `BannersEditor` ganha o campo `preHeadline` no array de fields, posicionado antes de `title`. Hint: "Texto pequeno em CAPS que aparece acima do título. Deixe vazio pra ocultar." Limite 50 chars (`maxLength`).
- [ ] 10.9.e — Tests: reader/writer cobrem novo campo + ausência (null)

**Acceptance**
- [ ] Banner com `preHeadline = null` → não mostra nada acima do título (zero UUID)
- [ ] Banner com `preHeadline = "Domingos · 9h e 19h"` → mostra esse texto em CAPS pequenos acima do título
- [ ] Admin pode editar/limpar o campo na aba Banners

**Acceptance combinado (10.6 + 10.7 + 10.8 + 10.9)**
- [ ] Cadastrar evento "Teste" pra daqui 30 min → contador grande mostra ~30 min
- [ ] Quando faltar < 24h, contador mostra título do evento (ex: "BATISMO" no lugar de "PRÓXIMO CULTO")
- [ ] Admin trocar URL do botão Assistir pra `https://youtube.com/live/...` → click abre nova aba
- [ ] Botão Assistir com `aoVivo=true` fica vermelho pulsante
- [ ] Numa quarta 22h, marquee não mostra mais "Quarta 19:30"
- [ ] Marquee no domingo 22h mostra "Sem mais eventos esta semana"
- [ ] Sparkles (✨) não aparece em nenhum lugar do site

**Fora de escopo da Phase 10**
- Recuperação de senha por e-mail (Supabase tem nativo, vira fase futura)
- Analytics/auditoria de quem editou o quê
- Drag-and-drop pra reordenar items (continua via campo `sort_order` numérico)
- Workflow de aprovação (admin revisa antes de publicar)
- Notificação push pra "evento começa em 5 min"

---

## 6. Riscos e decisões arquiteturais

| Risco | Mitigação |
|---|---|
| Admin edita só localStorage, não o site público | Documentar na UI + export JSON como ponte até Phase 7 |
| Bundle cresce com iframe do Maps | `loading="lazy"` no iframe + botão "Abrir no Maps" como alternativa |
| Dados TODO escapam pra produção | Phase 1.8 adiciona validação que quebra o build |
| Google Search indexa `/admin` ou `/login` | `robots.txt` bloqueando (Phase 6.4) |
| LGPD / cookies de tracking | Sem analytics por enquanto; se adicionar Phase 8 inclui banner de consent |
| Componentes `'use client'` não leem JSON diretamente no build | Helper em `lib/site-data.ts` roda server-side; client components recebem via props ou server components as parent |

---

## 7. Convenções

- **Commits:** Conventional Commits (`feat(phase-1):`, `refactor(data):`, `fix(admin):`)
- **PR por fase:** cada fase = 1 PR, merge só depois do checklist 100%
- **Testes manuais:** testes automatizados ficam pra Phase 7+
- **Idioma:** pt-BR em tudo que é visível ao usuário; código/commits em pt-BR também pra consistência
- **Tailwind:** usar tokens do tema (`bg-primary`, `text-accent`), não cores hard-coded

---

## 8. Status atual

- [x] Spec v2.7 escrito
- [x] **Phase 1 — Foundation** (concluída)
- [x] **Phase 2 — Geolocalização** (concluída)
- [x] **Phase 3 — Auth Supabase** (concluída ponta-a-ponta — login funcionando em dev e prod)
- [x] **Redesign editorial** (Fraunces + tokens novos + utilities) — aplicado fora de fase numerada, em paralelo com Phase 3
- [x] **Migração `middleware.ts` → `proxy.ts`** (Next 16 compliance)
- [x] **Phase 4 — Avisos banner** (concluída — `<AvisoBanner>` + aba `/admin/avisos` + 12 testes)
- [x] **Phase 7 — SEO local** (concluída — metadata por rota + sitemap + robots + JSON-LD + a11y básica)
- [x] **Phase 8 — Backend CMS** (concluída — 5 tabelas + Storage + readers/writers + 15 testes; admin escreve direto no banco)
- [x] **Phase 9 — Cobertura total do admin** (concluída — Igreja/Pastor/História editáveis via `cms_textos` KV + nova tabela `cms_historia`. Container "valor sugerido" removido de /contribua. 10 testes novos, 69 totais.)
- [ ] **Phase 10 — Refinos do admin** (em execução — convite de usuários, calendar preview, plano de leitura editável, multi-líderes, HelpHints. HelpHint component + remoção de dev notes já feitos.)
- [ ] ~~Phase 5 — Programação consolidada~~ → **fundida em 8**
- [ ] ~~Phase 6 — Admin UI editar JSON~~ → **fundida em 8 + 9**

**MVP em produção, Phase 10 em curso.** Após 10 estará 100% completo pelo plano original (e algumas extensões). Próximos passos opcionais pós-10: recuperação de senha, analytics, drag-and-drop pra reordenar.

### Pendências de conteúdo (não-código)

Hoje ainda dependem de admin preencher via `/admin → Igreja`:
- E-mail oficial da secretaria (campo `contatoEmail`)
- Chave PIX (campo `pixChave`)

Quando admin preencher esses campos no painel, os fallbacks TODO em
`data/church.json` deixam de ser usados em produção. JSON continua sendo
o fallback de SSR e build estático.

---

## 9. Histórico

| Data | Versão | Mudanças |
|---|---|---|
| 2026-04-28 | 2.9 | Phase 10 ganhou +1 frente (10.9): pré-headline editável em `cms_banners`. UUID estava vazando pro design via `banner.id.toUpperCase()` no eyebrow. Fix: nova coluna `pre_headline text` nullable + campo no admin + render condicional. |
| 2026-04-28 | 2.8 | Phase 10 ganhou 3 frentes novas (10.6, 10.7, 10.8) a partir de bugs reportados pelo stakeholder: contador "próximo culto" hardcoded ignorando `cms_eventos`, botão "Assistir" sem URL configurável, marquee mostrando horários passados + ícone Sparkles ✨ que parece IA. Cada item tem causa raiz + fix proposto + tasks. |
| 2026-04-26 | 2.7 | Phase 10 documentada (5 frentes: convite de usuários, calendar preview, plano de leitura editável, multi-líderes com popover, HelpHints substituindo dev notes). HelpHint component criado, caixas "Como funciona" removidas, `CardsEditor` ganhou prop `help`. Restante a executar. |
| 2026-04-25 | 2.6 | Phase 7 (SEO) entregue: metadata template no root + 12 layouts por rota com title/description/OG/Twitter/canonical específicos, /admin e /login com noindex, app/sitemap.ts dinâmico (11 URLs), app/robots.ts bloqueando admin/login, skip link no body, form labels do /contato linkados via htmlFor + autoComplete. Site está pronto pra Search Console. 69 testes mantidos. |
| 2026-04-25 | 2.5 | Phase 9 (cobertura total do admin) entregue: migration 003 com `cms_historia`, `getChurchEffective()` mergeando KV em cima do JSON, `/historia /pastor /contribua /contato /footer` consumindo CMS, 3 abas novas no admin (Igreja, Pastor, História), container de valores sugeridos removido de /contribua. 10 testes novos. Total: 69 testes. |
| 2026-04-25 | 2.4 | Phase 8 (CMS backend) entregue: migration 002 (5 tabelas + bucket + RLS), `lib/cms.ts` com readers/writers + upload, admin reescrito pra usar banco em vez de localStorage, páginas públicas leem do banco com fallback nos defaults, AvisoBanner também. 15 testes novos pra `lib/cms`. Phases 5/6 ficam fundidas aqui (banco substitui ambas). Total: 59 testes. |
| 2026-04-25 | 2.3 | Phase 4 (avisos globais) entregue: `<AvisoBanner>` + aba `/admin/avisos` + 12 testes RTL. Total: 44 testes passando. |
| 2026-04-25 | 2.2 | Phase 3 marcada como ✅ ponta-a-ponta (bootstrap rodou, login funcionando local+prod). Documentado o redesign editorial (Fraunces+tokens). Documentado rename `middleware.ts → proxy.ts`. Notas sobre fix CRLF parser + upsert profile no bootstrap. |
| 2026-04-23 | 2.1 | Phase 3 reescrita: era "Avisos banner", virou "Auth Supabase com first-login forçado". Fases seguintes renumeradas. Adicionado `Phase 8` pra CMS server-side. |
| 2026-04-20 | 2.0 | Reescrita com análise de estado atual, fases sequenciais, gaps da v1.3 resolvidos |
| 2026-04-21 | 1.3 | Spec original do usuário — identidade, controle, geolocalização |
