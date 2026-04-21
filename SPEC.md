# SPEC — Portal Institucional PIBAC

**Versão:** 2.0 (2026-04-20)
**Status:** Em execução — Phase 1 em andamento
**Substitui:** v1.3 de 21/04/2026

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

### Phase 3 — Aviso global
Objetivo: admin ativa banner no topo de todas as páginas em < 1 minuto.

**Tasks**
- 3.1. Estender `church.json` com `aviso: { ativo, severidade, mensagem, link, linkTexto }`
- 3.2. Componente `<AvisoBanner/>` que renderiza apenas se `aviso.ativo === true`
- 3.3. Severidades com tokens do design system:
  - `info` → fundo `bg-accent/10`, ícone azul
  - `atencao` → fundo `bg-yellow-50` + borda `border-yellow-300`
  - `urgente` → fundo `bg-destructive/10` + borda `border-destructive`
- 3.4. Botão X pra dispensar → persistir em `sessionStorage` (não reaparece na sessão, volta se abrir nova)
- 3.5. Injetar em `app/layout.tsx` acima do `<Header/>`
- 3.6. Aba "Avisos" no `/admin` com toggle + preview

**Acceptance**
- [ ] Setar `aviso.ativo = true` em `church.json` → banner aparece em TODAS as páginas após deploy
- [ ] Cor muda conforme severidade
- [ ] Usuário fecha e não reaparece na mesma sessão
- [ ] Sem banner, zero espaço visual consumido (condicional real)

---

### Phase 4 — Programação consolidada
Objetivo: eventos recorrentes vivem em um lugar, aparecem corretamente no calendário e lista.

**Tasks**
- 4.1. Criar `data/events.json` com `recorrentes` + `especiais`
- 4.2. Helper `getEventsForMonth(year, month)` que expande recorrentes pra cada semana
- 4.3. Refatorar `app/calendario/page.tsx` pra usar helper (ler do JSON, localStorage apenas como override)
- 4.4. Refatorar `app/eventos/page.tsx` idem
- 4.5. Criar `data/ministries.json` com estrutura sugerida
- 4.6. Migrar `lib/data.ts` → JSONs, deprecar constants antigas
- 4.7. Atualizar `/admin` pra ler/editar `ministries.json` e `events.json`

**Acceptance**
- [ ] EBD de domingo aparece em todos os domingos do calendário
- [ ] Evento especial de 03/05 aparece só naquele dia
- [ ] Editar ministério no admin reflete via localStorage (preview) sem quebrar a leitura do JSON
- [ ] `lib/data.ts` não é mais importado em nenhum componente

---

### Phase 5 — Admin UI expandido
Objetivo: leigo edita tudo sem mexer no git.

**Tasks**
- 5.1. Aba "Igreja" no `/admin` com formulários pra endereço, contato, socials
- 5.2. Aba "Pastor" com nome, bio, foto (upload → base64 preview)
- 5.3. Export JSON pra download (admin baixa o church.json editado, envia pra dev commitar)
- 5.4. Import JSON pra restaurar
- 5.5. Diff visual "Current vs Local override" pra deixar claro o que mudou

**Acceptance**
- [ ] Admin edita endereço, baixa `church.json`, commitamos, deploy mostra mudança
- [ ] Import JSON funciona
- [ ] Nada é enviado pra servidor (ainda) — só localStorage + download

---

### Phase 6 — SEO local
Objetivo: top 3 no Google pra "igreja batista Capim Grosso".

**Tasks**
- 6.1. `metadata` completo em cada `page.tsx` (title, description, OG, Twitter)
- 6.2. JSON-LD `Church` no `app/layout.tsx` usando dados de `church.json`
- 6.3. `app/sitemap.ts` dinâmico
- 6.4. `app/robots.ts`
- 6.5. Auditoria Lighthouse + correções de acessibilidade (alt text, contraste, labels)
- 6.6. Submeter sitemap ao Google Search Console

**Acceptance**
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse SEO ≥ 95
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Sitemap válido em `/sitemap.xml`
- [ ] Google Search Console verificado

---

### Phase 7 — Backend real (futuro, fora do escopo imediato)
- Supabase ou Firebase pra persistir o conteúdo editado no admin
- Auth real (Clerk, NextAuth, Supabase Auth)
- Upload de imagens pra storage (Cloudinary / Uploadthing / Supabase Storage)
- Webhook pra revalidar páginas no Vercel

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

- [x] Spec v2.0 escrito
- [x] **Phase 1 — Foundation** (concluída)
- [x] **Phase 2 — Geolocalização** (concluída)
- [ ] **Phase 3 — Avisos banner** — próxima
- [ ] Phase 4, 5, 6, 7 — aguardando

---

## 9. Histórico

| Data | Versão | Mudanças |
|---|---|---|
| 2026-04-20 | 2.0 | Reescrita com análise de estado atual, fases sequenciais, gaps da v1.3 resolvidos |
| 2026-04-21 | 1.3 | Spec original do usuário — identidade, controle, geolocalização |
