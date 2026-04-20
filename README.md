# Site PIBAC — Primeira Igreja Batista de Capim Grosso

Site institucional da PIBAC em **Next.js 16 + Tailwind v4**, com calendário interativo, plano de leitura, área de contribuições, e um painel `/admin` (demo, client-side) para gerenciar imagens e textos.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **Tailwind CSS v4** + shadcn/ui
- **lucide-react** (ícones)
- **embla-carousel**, **react-day-picker**, **sonner**

## Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Azul profundo | `#0A2973` | Primária |
| Cyan brilhante | `#00C2FF` | Highlight / accent |
| Azul quase preto | `#020B21` | Texto / contraste escuro |
| Branco | `#FFFFFF` | Fundo |
| Vermelho | `#FF2A2A` | Apenas detalhes |

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # ajuste as credenciais do admin
npm run dev
```

Abra http://localhost:3000.

### Scripts

- `npm run dev` — servidor de dev
- `npm run build` — build de produção
- `npm start` — servir o build

## Estrutura

```
app/
  page.tsx              # Home
  quem-somos/           # Sobre a igreja
  historia/             # Linha do tempo
  visao/                # Missão, visão, propósito
  pastor/               # Pastor Presidente
  ministerios/          # Cards de ministérios com busca
  eventos/              # Lista de eventos com filtros
  calendario/           # Calendário interativo + export .ics
  plano-leitura/        # 30 dias com progresso salvo
  contribua/            # PIX, transferência e presencial
  contato/              # Formulário + mapa
  login/                # Login demo
  admin/                # Painel de conteúdo (CMS client-side)
components/
  layout/{header,footer}.tsx
  banner-carousel.tsx
  section-title.tsx
  ui/*                  # shadcn/ui
lib/
  auth.tsx              # Auth client-side (DEMO)
  data.ts               # Dados iniciais (ministérios, eventos, plano)
```

## Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe este repositório.
2. Em **Environment Variables**, defina (pelo menos):
   - `NEXT_PUBLIC_ADMIN_EMAIL`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
3. Clique em **Deploy**. A Vercel detecta Next.js automaticamente.

## Painel de conteúdo (/admin)

O painel permite editar banners, ministérios, eventos/datas do calendário e textos da home. As alterações ficam no `localStorage` do navegador do conteudísta — são **pessoais e temporárias**, servem como preview.

Para persistência real e acesso da equipe inteira, é preciso conectar a um backend (Supabase, Firebase, ou uma API própria) — ver seção "Próximos passos" abaixo.

## ⚠️ Segurança — limitações atuais

Este repositório é um **site estático com CMS de demonstração**. Antes de usar em produção:

- **Auth é client-side**. As credenciais viajam no bundle JS e podem ser lidas via DevTools. Substitua por NextAuth/Clerk/Supabase/Firebase Auth antes de disponibilizar o admin para terceiros.
- **CMS é localStorage**. Trocar de dispositivo ou limpar o cache apaga as edições. Plugue em um backend real (Supabase, Firebase Firestore, Sanity, etc.).
- **Formulários não enviam para servidor**. `/contato` e `/login` processam só no cliente — para receber e-mails, integre Formspree/Brevo/Resend ou um endpoint próprio.
- **Troque a senha padrão** (`.env.local`) antes de compartilhar o deploy.

## Próximos passos sugeridos

- [ ] Migrar auth para NextAuth ou Clerk
- [ ] Substituir `localStorage` por Supabase/Firebase
- [ ] Integrar formulário de contato com Resend/Formspree
- [ ] Adicionar upload de imagens para um storage (Uploadthing, Cloudinary)
- [ ] Política de privacidade e consentimento de cookies

## Licença

Uso exclusivo da Primeira Igreja Batista de Capim Grosso.
