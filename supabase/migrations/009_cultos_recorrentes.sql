-- =========================================================================
-- Migration 009 — Cultos recorrentes editáveis
-- =========================================================================
-- Substitui o array hardcoded `horariosCultos` em lib/data.ts por uma
-- tabela no banco, editável pelo admin. Cada linha é um culto que
-- acontece toda semana no mesmo dia/horário.
--
-- 100% IDEMPOTENTE.
-- =========================================================================

create table if not exists public.cms_cultos_recorrentes (
  id           uuid          primary key default gen_random_uuid(),
  dia_semana   int           not null,  -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  horario      text          not null,  -- "19:00"
  horario_fim  text          not null default '20:30',
  titulo       text          not null,
  descricao    text          not null default '',
  local        text          not null default 'Templo Sede',
  categoria    text          not null default 'culto',
  image_url    text,
  sort_order   int           not null default 0,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

comment on table public.cms_cultos_recorrentes is 'Cultos/reuniões que acontecem toda semana no mesmo dia e horário.';

create index if not exists cms_cultos_recorrentes_sort_idx
  on public.cms_cultos_recorrentes (sort_order, dia_semana);

-- RLS
alter table public.cms_cultos_recorrentes enable row level security;

drop policy if exists "cms_cultos_rec_read_all"     on public.cms_cultos_recorrentes;
drop policy if exists "cms_cultos_rec_writer_insert" on public.cms_cultos_recorrentes;
drop policy if exists "cms_cultos_rec_writer_update" on public.cms_cultos_recorrentes;
drop policy if exists "cms_cultos_rec_writer_delete" on public.cms_cultos_recorrentes;

create policy "cms_cultos_rec_read_all"
  on public.cms_cultos_recorrentes for select
  to anon, authenticated using (true);

create policy "cms_cultos_rec_writer_insert"
  on public.cms_cultos_recorrentes for insert
  to authenticated with check (public.is_cms_writer());

create policy "cms_cultos_rec_writer_update"
  on public.cms_cultos_recorrentes for update
  to authenticated
  using (public.is_cms_writer()) with check (public.is_cms_writer());

create policy "cms_cultos_rec_writer_delete"
  on public.cms_cultos_recorrentes for delete
  to authenticated using (public.is_cms_writer());

-- Trigger updated_at
drop trigger if exists cms_cultos_rec_updated on public.cms_cultos_recorrentes;
create trigger cms_cultos_rec_updated before update on public.cms_cultos_recorrentes
  for each row execute procedure public.handle_updated_at();

-- Seeds (os 4 cultos semanais atuais)
insert into public.cms_cultos_recorrentes (dia_semana, horario, horario_fim, titulo, descricao, local, categoria, sort_order)
select * from (values
  (0, '09:00', '10:30', 'Escola Bíblica Dominical',  'Estudo bíblico para todas as idades.',   'Templo Sede', 'escola',  1),
  (0, '19:00', '20:30', 'Culto de Celebração',       'Culto principal da semana.',             'Templo Sede', 'culto',   2),
  (3, '19:30', '21:00', 'Culto de Oração e Estudo',  'Estudo bíblico e oração comunitária.',   'Templo Sede', 'estudo',  3),
  (6, '19:30', '21:00', 'Encontro de Jovens',        'Reunião semanal da juventude.',          'Templo Sede', 'encontro',4)
) as v(dia_semana, horario, horario_fim, titulo, descricao, local, categoria, sort_order)
where not exists (select 1 from public.cms_cultos_recorrentes);
