-- =========================================================================
-- Migration 008 — Mensagens de contato (Phase 11.1)
-- =========================================================================
-- Tabela para receber mensagens do formulário de contato.
-- RLS: anon pode inserir (visitantes), admin/conteudista pode ler e atualizar.
--
-- 100% IDEMPOTENTE.
-- =========================================================================

-- ---------- 1. Tabela ----------

create table if not exists public.cms_contato_mensagens (
  id           uuid          primary key default gen_random_uuid(),
  nome         text          not null,
  email        text          not null,
  telefone     text,
  assunto      text          not null,
  mensagem     text          not null,
  lido         boolean       not null default false,
  created_at   timestamptz   not null default now()
);

comment on table public.cms_contato_mensagens is 'Mensagens recebidas via formulário de contato do site.';

create index if not exists cms_contato_mensagens_created_idx
  on public.cms_contato_mensagens (created_at desc);

create index if not exists cms_contato_mensagens_lido_idx
  on public.cms_contato_mensagens (lido) where lido = false;

-- ---------- 2. RLS ----------

alter table public.cms_contato_mensagens enable row level security;

drop policy if exists "cms_contato_anon_insert"   on public.cms_contato_mensagens;
drop policy if exists "cms_contato_writer_read"    on public.cms_contato_mensagens;
drop policy if exists "cms_contato_writer_update"  on public.cms_contato_mensagens;
drop policy if exists "cms_contato_writer_delete"  on public.cms_contato_mensagens;

-- Visitantes (anon) podem inserir mensagens
create policy "cms_contato_anon_insert"
  on public.cms_contato_mensagens for insert
  to anon, authenticated
  with check (true);

-- Admin/conteudista podem ler
create policy "cms_contato_writer_read"
  on public.cms_contato_mensagens for select
  to authenticated
  using (public.is_cms_writer());

-- Admin/conteudista podem marcar como lido
create policy "cms_contato_writer_update"
  on public.cms_contato_mensagens for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

-- Admin/conteudista podem deletar
create policy "cms_contato_writer_delete"
  on public.cms_contato_mensagens for delete
  to authenticated
  using (public.is_cms_writer());
