# PROGRESS — Estado atual do projeto PIBAC

> **Leia isto antes de começar qualquer tarefa nova.**
> Documento de handoff entre sessões. Evita refazer decisões já tomadas.
> Fonte canônica do "o que já foi feito vs. o que ainda falta".
>
> **Última atualização:** 2026-04-21
> **SPEC correspondente:** [`SPEC.md`](./SPEC.md) v2.0
> **Último commit relevante:** `aec9241`

---

## 0. Como usar este doc

Em sessões futuras, quando você (usuário) escrever algo como:

> _"prossiga com a fase 3"_ ou _"veja onde paramos"_

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
| Dados institucionais | `data/church.json` (canônico) | Import estático via `@/data/church.json` |
| Reader tipado | `lib/site-data.ts` | Expõe types + helpers (ver seção 3) |
| CMS admin | `localStorage` (`pibac-cms-*`) | Preview local apenas; não substitui JSON |
| Deploy | Vercel auto-deploy no push `main` | Repo: `github.com/abraaocastro/site-igreja` |
| URL preview | `https://pibac.vercel.app` | Produção quando tiver domínio próprio |
| Fluxo git | Push direto em `main`, sem PR | Divergente da SPEC §7, mas acordado |

**Pasta `src/` NÃO existe.** Código vive direto em `app/`, `components/`, `lib/`, `data/`.

---

## 2. Commits já pushados para `main`

| SHA | Título | O que entregou |
|---|---|---|
| `04ceff2` | Initial commit | Site Next.js inicial com dados fictícios |
| `7d0badf` | chore: ignore tsbuildinfo | - |
| `6f6f019` | feat(ui): logo maior + carousel sem setas | Header com logo 16→20, carousel drag-only com autoplay |
| `cec495d` | feat(phases-1-2): identidade canônica + geolocalização | Criou `data/church.json`, `lib/site-data.ts`, JSON-LD no layout, refactor de footer/contato/pastor/admin pra consumir JSON, Maps deep-links |
| `aec9241` | feat(phase-1): popular church.json com dados reais + ministérios com líderes | Respostas do questionário aplicadas; ministérios reais; infra PIX pronta (sem chave) |

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
| `aviso.ativo` | ✅ Definido | `false` (Fase 3 vai usar isso) |

**Quando o usuário fornecer um TODO:** basta editar `data/church.json` e pushar. Os componentes já consomem condicionalmente — renderizam automático quando o valor sai de TODO.

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

Nota: ainda vive em `lib/data.ts`. SPEC §4 prevê migração para `data/ministries.json` em fase futura, mas **não é prioridade agora** — a tipagem `Ministerio` já está limpa.

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

---

## 7. Componentes que consomem `site-data` (rastreabilidade)

Se precisar mudar formato de endereço/telefone/etc, mexer aqui:

| Arquivo | O que consome |
|---|---|
| `app/layout.tsx` | `getChurchJsonLd()` — injeta JSON-LD no `<head>` |
| `app/page.tsx` | `getChurch()`, `formatAddressOneLine()` |
| `app/contato/page.tsx` | Endereço, telefone, WhatsApp, email, socials, mapa (embed + directions + search) |
| `app/pastor/page.tsx` | `pastor.bio` (array), `pastor.foto`, `pastor.instagram`, contato |
| `app/contribua/page.tsx` | `pix.chave` + `hasPix()` (estado "em configuração") |
| `app/admin/page.tsx` | `getChurch()` como fallback inicial de textos editáveis |
| `components/layout/footer.tsx` | Endereço (link Maps), telefone, WhatsApp, email, socials |

---

## 8. Plano de fases (SPEC §5-6)

| Fase | Nome | Status | Entregue em |
|---|---|---|---|
| 1 | Fundação: `data/` + tipos + migração de hard-codes | ✅ Completa | `cec495d` + `aec9241` |
| 2 | Geolocalização (Maps embed, directions, search) | ✅ Completa | `cec495d` |
| 3 | Avisos globais (banner toggleável com severidade) | ⏭️ **Próxima** | — |
| 4 | Programação (eventos + horários consolidados) | ⬜ Pendente | — |
| 5 | Admin UI pra editar JSON (via PR ou backend) | ⬜ Pendente | — |
| 6 | SEO completo (sitemap, robots, OG, rich results) | ⬜ Pendente | Base JSON-LD já entregue |
| 7 | Backend real (substitui localStorage + client-auth) | ⬜ Pendente | — |

---

## 9. Débitos técnicos conhecidos (baixa prioridade)

1. **Credenciais inconsistentes**: `.env.example` usa `troque-esta-senha`, `lib/auth.tsx` fallback usa `trocar-esta-senha`. Padronizar quando mexer em auth.
2. **`lib/data.ts`** ainda tem `heroBanners`, `inlineBanners`, `eventos`, `planoLeitura`, `horariosCultos` hardcoded. Migrar em Fases 3/4.
3. **Git CRLF warnings** ao commitar em Windows — cosmético, não bloqueia.
4. **Next build pula validação de tipos** (config default) — rodar `npx tsc --noEmit` manualmente como gate antes de commitar mudança de tipo.

---

## 10. Checklist de "definition of done" para qualquer fase nova

Antes de pushar:

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx next build` passa (15 rotas estáticas)
- [ ] Nenhum `TODO-*` visível em página renderizada
- [ ] Nenhum valor hard-coded que deveria estar em `data/church.json`
- [ ] Componentes novos consomem `site-data.ts`, não strings literais
- [ ] Commit message segue convenção `feat(phase-N): descricao curta`
- [ ] `PROGRESS.md` atualizado com o que mudou (seções 2 e 8)

---

## 11. Como retomar

Em uma nova sessão, cole isto pro agente:

> "Leia `PROGRESS.md` primeiro. Depois me diga em que fase estamos e qual é o próximo passo da SPEC.md. Não me faça perguntas que já estão respondidas na seção 6 do PROGRESS."

Ou, mais curto:

> "Continue de onde paramos (ver `PROGRESS.md`)."
