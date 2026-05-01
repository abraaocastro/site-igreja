-- =========================================================================
-- Migration 004 — Plano de Leitura editável (Phase 10.3)
-- =========================================================================
-- Tabela `cms_plano_leitura` com RLS no padrão dos outros CMS tables.
-- Seed inicial com os 30 dias de lib/data.ts#planoLeitura.
--
-- 100% IDEMPOTENTE. Pode rodar várias vezes.
--
-- Como rodar:
--   1. Abra o SQL Editor no Supabase Dashboard
--   2. New query → cole este arquivo inteiro → Run
--   3. Verifique em Table Editor se `cms_plano_leitura` existe
-- =========================================================================

-- ---------- 1. Tabela ----------

create table if not exists public.cms_plano_leitura (
  id           uuid          primary key default gen_random_uuid(),
  dia          int           not null,
  livro        text          not null,
  capitulos    text          not null,
  tema         text          not null default '',
  sort_order   int           not null default 0,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

comment on table public.cms_plano_leitura is 'Plano de leitura bíblica. Cada linha é um dia do plano.';

create index if not exists cms_plano_leitura_sort_idx on public.cms_plano_leitura (sort_order, dia);

-- ---------- 2. RLS ----------

alter table public.cms_plano_leitura enable row level security;

drop policy if exists "cms_plano_leitura_read_all"      on public.cms_plano_leitura;
drop policy if exists "cms_plano_leitura_writer_insert" on public.cms_plano_leitura;
drop policy if exists "cms_plano_leitura_writer_update" on public.cms_plano_leitura;
drop policy if exists "cms_plano_leitura_writer_delete" on public.cms_plano_leitura;

create policy "cms_plano_leitura_read_all"
  on public.cms_plano_leitura for select
  to anon, authenticated
  using (true);

create policy "cms_plano_leitura_writer_insert"
  on public.cms_plano_leitura for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_plano_leitura_writer_update"
  on public.cms_plano_leitura for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

create policy "cms_plano_leitura_writer_delete"
  on public.cms_plano_leitura for delete
  to authenticated
  using (public.is_cms_writer());

-- ---------- 3. Trigger updated_at ----------

drop trigger if exists cms_plano_leitura_updated on public.cms_plano_leitura;
create trigger cms_plano_leitura_updated before update on public.cms_plano_leitura
  for each row execute procedure public.handle_updated_at();

-- ---------- 4. Seeds (30 dias, Gênesis → Provérbios) ----------

insert into public.cms_plano_leitura (dia, livro, capitulos, tema, sort_order)
select * from (values
  (1,  'Gênesis',    '1-3',   'A Criação',                    1),
  (2,  'Gênesis',    '4-7',   'Caim, Abel e Noé',             2),
  (3,  'Gênesis',    '8-11',  'O Dilúvio e a Torre de Babel', 3),
  (4,  'Gênesis',    '12-15', 'Chamado de Abraão',            4),
  (5,  'Gênesis',    '16-19', 'Abraão e Ló',                  5),
  (6,  'Gênesis',    '20-23', 'Isaque e Sara',                6),
  (7,  'Gênesis',    '24-27', 'Isaque e Rebeca',              7),
  (8,  'Gênesis',    '28-31', 'Jacó',                         8),
  (9,  'Gênesis',    '32-35', 'Jacó se torna Israel',         9),
  (10, 'Gênesis',    '36-39', 'José no Egito',                10),
  (11, 'Gênesis',    '40-43', 'José interpreta sonhos',       11),
  (12, 'Gênesis',    '44-47', 'José revela-se',               12),
  (13, 'Gênesis',    '48-50', 'Bênçãos de Jacó',             13),
  (14, 'Êxodo',      '1-4',   'Nascimento de Moisés',         14),
  (15, 'Êxodo',      '5-8',   'As Pragas',                    15),
  (16, 'Êxodo',      '9-12',  'A Páscoa',                     16),
  (17, 'Êxodo',      '13-16', 'Travessia do Mar Vermelho',    17),
  (18, 'Êxodo',      '17-20', 'Os Dez Mandamentos',           18),
  (19, 'Êxodo',      '21-24', 'Leis e Ordenanças',            19),
  (20, 'Êxodo',      '25-28', 'O Tabernáculo',                20),
  (21, 'Êxodo',      '29-32', 'O Bezerro de Ouro',            21),
  (22, 'Êxodo',      '33-36', 'Renovação da Aliança',         22),
  (23, 'Êxodo',      '37-40', 'Construção do Tabernáculo',    23),
  (24, 'Salmos',     '1-8',   'Louvor e Adoração',            24),
  (25, 'Salmos',     '9-16',  'Confiança em Deus',            25),
  (26, 'Salmos',     '17-24', 'O Bom Pastor',                 26),
  (27, 'Salmos',     '25-32', 'Perdão e Restauração',         27),
  (28, 'Salmos',     '33-40', 'Esperança no Senhor',          28),
  (29, 'Provérbios', '1-5',   'Sabedoria',                    29),
  (30, 'Provérbios', '6-10',  'Conselhos para a Vida',        30)
) as v(dia, livro, capitulos, tema, sort_order)
where not exists (select 1 from public.cms_plano_leitura);
