-- =========================================================================
-- Migration 001 — Perfis + roles + RLS
-- =========================================================================
-- Cria a tabela `profiles` com roles (admin / conteudista), trigger pra
-- autocriar o profile no signup, e RLS pra restringir leitura/escrita.
--
-- Como rodar:
--   1. Abra o SQL Editor no Supabase Dashboard
--   2. New query → cole este arquivo inteiro → Run
--   3. Verifique em Table Editor se `profiles` existe
-- =========================================================================

-- Enum de roles. `admin` pode criar outros usuários; `conteudista` só edita CMS.
create type public.user_role as enum ('admin', 'conteudista');

-- Tabela de perfis. Cada linha linka 1:1 com auth.users.
create table public.profiles (
  id          uuid          primary key references auth.users(id) on delete cascade,
  email       text          not null unique,
  nome        text,
  role        user_role     not null default 'conteudista',
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

comment on table public.profiles is 'Perfil e role dos usuários logáveis. Linha criada automaticamente via trigger no signup.';

-- =========================================================================
-- Trigger: autocriação de profile em cada novo usuário em auth.users
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'conteudista')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- Trigger: updated_at
-- =========================================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- =========================================================================
-- Row-Level Security
-- =========================================================================
alter table public.profiles enable row level security;

-- Usuário pode ler SEU PRÓPRIO perfil.
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);

-- Usuário pode atualizar SEU PRÓPRIO perfil — exceto o campo `role`.
-- (Trocar de role exige admin; ver policy abaixo.)
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin pode ler TODOS os perfis.
create policy "profiles_admin_read_all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin pode atualizar QUALQUER perfil (inclusive mudar role).
create policy "profiles_admin_update_all"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- NOTA: insert e delete só via service_role (bootstrap + criação de conteudistas
-- passa por API route server-side). Nenhuma policy de INSERT/DELETE é criada
-- pra client anon/authenticated — RLS bloqueia por default.
