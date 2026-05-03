# Site PIBAC — Primeira Igreja Batista de Capim Grosso

Site institucional da PIBAC em **Next.js 16 + Tailwind v4 + Supabase**, com calendário interativo, plano de leitura bíblica editável, área de contribuições, e um painel `/admin` com CMS completo persistido no banco.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **Tailwind CSS v4** + shadcn/ui
- **Supabase** (Auth + Postgres + Storage)
- **lucide-react** (ícones)
- **embla-carousel**, **react-day-picker**, **sonner**, **zxcvbn-ts**
- **Vitest + React Testing Library** (testes)

## Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Azul profundo | `#0A2973` | Primária |
| Cyan brilhante | `#00C2FF` | Highlight / accent |
| Azul quase preto | `#020B21` | Texto / contraste escuro |
| Branco | `#FFFFFF` | Fundo |
| Vermelho | `#FF2A2A` | Apenas detalhes |

Fontes: **Inter** (sans), **Fraunces** (serif editorial), **JetBrains Mono** (números/eyebrow).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com credenciais do Supabase
npm run bootstrap:admin       # cria o admin padrão
npm run dev
```

Abra http://localhost:3000.

### Variáveis de ambiente necessárias

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Scripts

- `npm run dev` — servidor de dev
- `npm run build` — build de produção
- `npm test` — roda testes (Vitest)
- `npm run typecheck` — verificação de tipos
- `npm run bootstrap:admin` — cria/reseta o admin padrão

## Estrutura

```
app/
  page.tsx              # Home
  quem-somos/           # Sobre a igreja
  historia/             # Linha do tempo (editável via admin)
  visao/                # Missão, visão, propósito
  pastor/               # Pastor Presidente (editável via admin)
  ministerios/          # Cards com múltiplos líderes + popover
  eventos/              # Lista de eventos com filtros
  calendario/           # Calendário interativo + export .ics
  plano-leitura/        # 30 dias com progresso salvo (editável via admin)
  contribua/            # PIX e informações de contribuição
  contato/              # Formulário + mapa
  login/                # Login com Supabase Auth
  admin/                # Painel de conteúdo (CMS no Supabase)
  api/admin/users/      # API route para gerenciar conteudistas
  api/contato/          # API route para formulário de contato
components/
  layout/{header,footer}.tsx
  banner-carousel.tsx
  section-title.tsx
  aviso-banner.tsx        # Banner de avisos com severidade
  help-hint.tsx           # Popover de ajuda (?) no admin
  leaders-popover.tsx     # Exibe 1 líder inline ou N líderes em popover
  password-strength.tsx   # Medidor de força de senha (zxcvbn)
  admin/calendar-preview.tsx  # Mini-calendário no EventosEditor
  ui/*                    # shadcn/ui
lib/
  auth.tsx              # AuthProvider + useAuth (Supabase Auth)
  cms.ts                # Readers/writers do CMS (Supabase)
  calendar-utils.ts     # Funções compartilhadas do calendário
  next-event.ts         # Próximo evento inteligente (countdown + marquee)
  image-utils.ts        # Resize e compressão de imagens no client
  data.ts               # Dados defaults (fallback se DB offline)
  password-strength.ts  # evaluatePassword + generatePassphrase
  site-data.ts          # Reader tipado de data/church.json
  supabase/             # Clientes Supabase (browser, server, admin)
supabase/migrations/    # Migrations SQL (rodar no SQL Editor)
scripts/
  bootstrap-admin.ts    # Cria/reseta o admin padrão
```

## Painel de conteúdo (/admin)

O painel permite editar banners, ministérios (com múltiplos líderes), eventos/datas, plano de leitura, textos da home, dados da igreja, pastor, história e avisos globais. Tudo é persistido no Supabase e visível para todos os visitantes.

**Roles:**
- **Admin** — acesso total, incluindo convidar/revogar conteudistas
- **Conteudista** — acesso a tudo exceto gerenciamento de usuários

## Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe este repositório.
2. Em **Environment Variables**, defina:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Clique em **Deploy**.
4. Rode as migrations (`supabase/migrations/*.sql`) no SQL Editor do Supabase.
5. Rode `npm run bootstrap:admin` localmente para criar o admin.

## Migrations

Rodar no Supabase SQL Editor na ordem:
1. `001_profiles_and_roles.sql`
2. `002_cms_content.sql`
3. `003_cms_full.sql`
4. `004_plano_leitura.sql`
5. `005_multi_leaders.sql`
6. `006_banner_pre_headline.sql`
7. `007_evento_end_time.sql`
8. `008_contato_mensagens.sql`

## Licença

Uso exclusivo da Primeira Igreja Batista de Capim Grosso.
