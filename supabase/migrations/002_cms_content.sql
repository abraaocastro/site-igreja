-- =========================================================================
-- Migration 002 — Conteúdo CMS (Phase 8)
-- =========================================================================
-- Substitui o armazenamento em localStorage do /admin por tabelas reais.
-- Tudo aqui é PÚBLICO PRA LEITURA (anon + authenticated). Apenas
-- admins e conteudistas escrevem (RLS via helper is_cms_writer()).
--
-- 100% IDEMPOTENTE — pode rodar várias vezes sem efeito colateral.
-- (`if not exists` em tudo + `drop policy if exists` antes de cada create.)
--
-- Cobre:
--   1. Função is_cms_writer()     → checa role do profile
--   2. Tabela cms_banners         → carousel da home
--   3. Tabela cms_ministerios     → cards de ministérios
--   4. Tabela cms_eventos         → eventos e datas
--   5. Tabela cms_textos          → KV store de textos editáveis
--   6. Tabela cms_avisos          → banner de avisos (singleton id=1)
--   7. Bucket Storage public-images → upload de imagens (público)
--   8. Triggers de updated_at em todas
--   9. Seeds iniciais a partir do que vivia em lib/data.ts
--
-- Como rodar:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Cole este arquivo inteiro → Run
--   3. Verifique em Table Editor que as 5 tabelas existem
--   4. Verifique em Storage que o bucket public-images existe e está público
-- =========================================================================

-- ---------- 1. Helper: quem pode escrever no CMS ----------

create or replace function public.is_cms_writer()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'conteudista')
  );
$$;

-- ---------- 2. cms_banners ----------

create table if not exists public.cms_banners (
  id          uuid          primary key default gen_random_uuid(),
  title       text          not null,
  subtitle    text,
  image_url   text          not null,
  button_text text,
  link        text,
  sort_order  int           not null default 0,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

comment on table public.cms_banners is 'Banners do carrossel da home. Editável via /admin.';

create index if not exists cms_banners_sort_idx on public.cms_banners (sort_order, created_at);

alter table public.cms_banners enable row level security;

drop policy if exists "cms_banners_read_all"        on public.cms_banners;
drop policy if exists "cms_banners_writer_insert"   on public.cms_banners;
drop policy if exists "cms_banners_writer_update"   on public.cms_banners;
drop policy if exists "cms_banners_writer_delete"   on public.cms_banners;

create policy "cms_banners_read_all"
  on public.cms_banners for select
  to anon, authenticated
  using (true);

create policy "cms_banners_writer_insert"
  on public.cms_banners for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_banners_writer_update"
  on public.cms_banners for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

create policy "cms_banners_writer_delete"
  on public.cms_banners for delete
  to authenticated
  using (public.is_cms_writer());

-- ---------- 3. cms_ministerios ----------

create table if not exists public.cms_ministerios (
  id                uuid          primary key default gen_random_uuid(),
  name              text          not null,
  description       text          not null default '',
  image_url         text          not null,
  leader            text          not null default '',
  leader_instagram  text,
  sort_order        int           not null default 0,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

comment on table public.cms_ministerios is 'Cards de ministérios. Editável via /admin.';

create index if not exists cms_ministerios_sort_idx on public.cms_ministerios (sort_order, created_at);

alter table public.cms_ministerios enable row level security;

drop policy if exists "cms_ministerios_read_all"      on public.cms_ministerios;
drop policy if exists "cms_ministerios_writer_insert" on public.cms_ministerios;
drop policy if exists "cms_ministerios_writer_update" on public.cms_ministerios;
drop policy if exists "cms_ministerios_writer_delete" on public.cms_ministerios;

create policy "cms_ministerios_read_all"
  on public.cms_ministerios for select
  to anon, authenticated
  using (true);

create policy "cms_ministerios_writer_insert"
  on public.cms_ministerios for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_ministerios_writer_update"
  on public.cms_ministerios for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

create policy "cms_ministerios_writer_delete"
  on public.cms_ministerios for delete
  to authenticated
  using (public.is_cms_writer());

-- ---------- 4. cms_eventos ----------

create table if not exists public.cms_eventos (
  id           uuid          primary key default gen_random_uuid(),
  title        text          not null,
  description  text          not null default '',
  date         date          not null,
  time         text          not null default '19:00',
  location     text          not null default '',
  category     text          not null default 'evento',
  image_url    text,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

comment on table public.cms_eventos is 'Eventos e datas marcadas. Editável via /admin.';

create index if not exists cms_eventos_date_idx on public.cms_eventos (date);

alter table public.cms_eventos enable row level security;

drop policy if exists "cms_eventos_read_all"      on public.cms_eventos;
drop policy if exists "cms_eventos_writer_insert" on public.cms_eventos;
drop policy if exists "cms_eventos_writer_update" on public.cms_eventos;
drop policy if exists "cms_eventos_writer_delete" on public.cms_eventos;

create policy "cms_eventos_read_all"
  on public.cms_eventos for select
  to anon, authenticated
  using (true);

create policy "cms_eventos_writer_insert"
  on public.cms_eventos for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_eventos_writer_update"
  on public.cms_eventos for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

create policy "cms_eventos_writer_delete"
  on public.cms_eventos for delete
  to authenticated
  using (public.is_cms_writer());

-- ---------- 5. cms_textos (KV) ----------

create table if not exists public.cms_textos (
  key         text          primary key,
  value       text          not null default '',
  updated_at  timestamptz   not null default now()
);

comment on table public.cms_textos is 'KV de textos editáveis (homeTitulo, versiculoDestaque, etc.).';

alter table public.cms_textos enable row level security;

drop policy if exists "cms_textos_read_all"      on public.cms_textos;
drop policy if exists "cms_textos_writer_insert" on public.cms_textos;
drop policy if exists "cms_textos_writer_update" on public.cms_textos;
drop policy if exists "cms_textos_writer_delete" on public.cms_textos;

create policy "cms_textos_read_all"
  on public.cms_textos for select
  to anon, authenticated
  using (true);

create policy "cms_textos_writer_insert"
  on public.cms_textos for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_textos_writer_update"
  on public.cms_textos for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

create policy "cms_textos_writer_delete"
  on public.cms_textos for delete
  to authenticated
  using (public.is_cms_writer());

-- ---------- 6. cms_avisos (singleton) ----------

create table if not exists public.cms_avisos (
  id           int           primary key check (id = 1),
  ativo        boolean       not null default false,
  severidade   text          not null default 'info' check (severidade in ('info', 'atencao', 'urgente')),
  mensagem     text          not null default '',
  link         text,
  link_texto   text,
  updated_at   timestamptz   not null default now()
);

comment on table public.cms_avisos is 'Banner de aviso global. Sempre uma única linha id=1.';

alter table public.cms_avisos enable row level security;

drop policy if exists "cms_avisos_read_all"      on public.cms_avisos;
drop policy if exists "cms_avisos_writer_insert" on public.cms_avisos;
drop policy if exists "cms_avisos_writer_update" on public.cms_avisos;

create policy "cms_avisos_read_all"
  on public.cms_avisos for select
  to anon, authenticated
  using (true);

create policy "cms_avisos_writer_insert"
  on public.cms_avisos for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_avisos_writer_update"
  on public.cms_avisos for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

-- Linha singleton garantida desde já
insert into public.cms_avisos (id, ativo, severidade, mensagem)
  values (1, false, 'info', '')
on conflict (id) do nothing;

-- ---------- 7. Bucket Storage public-images ----------

insert into storage.buckets (id, name, public)
  values ('public-images', 'public-images', true)
on conflict (id) do nothing;

drop policy if exists "public_images_read"   on storage.objects;
drop policy if exists "public_images_insert" on storage.objects;
drop policy if exists "public_images_update" on storage.objects;
drop policy if exists "public_images_delete" on storage.objects;

create policy "public_images_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'public-images');

create policy "public_images_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'public-images'
    and public.is_cms_writer()
  );

create policy "public_images_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-images' and public.is_cms_writer())
  with check (bucket_id = 'public-images' and public.is_cms_writer());

create policy "public_images_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-images' and public.is_cms_writer());

-- ---------- 8. Triggers de updated_at ----------

drop trigger if exists cms_banners_updated     on public.cms_banners;
drop trigger if exists cms_ministerios_updated on public.cms_ministerios;
drop trigger if exists cms_eventos_updated     on public.cms_eventos;
drop trigger if exists cms_textos_updated      on public.cms_textos;
drop trigger if exists cms_avisos_updated      on public.cms_avisos;

create trigger cms_banners_updated      before update on public.cms_banners      for each row execute procedure public.handle_updated_at();
create trigger cms_ministerios_updated  before update on public.cms_ministerios  for each row execute procedure public.handle_updated_at();
create trigger cms_eventos_updated      before update on public.cms_eventos      for each row execute procedure public.handle_updated_at();
create trigger cms_textos_updated       before update on public.cms_textos       for each row execute procedure public.handle_updated_at();
create trigger cms_avisos_updated       before update on public.cms_avisos       for each row execute procedure public.handle_updated_at();

-- ---------- 9. Seeds iniciais ----------
-- Popula com o conteúdo que vivia em lib/data.ts. Idempotente via
-- `WHERE NOT EXISTS`: se a tabela já tem qualquer linha, o INSERT vira no-op.
-- (Sem DO/PL-pgSQL — paste-friendly, statements normais.)

insert into public.cms_banners (title, subtitle, image_url, link, button_text, sort_order)
select * from (values
  ('Bem-vindo à Primeira Igreja Batista de Capim Grosso',
   'Uma comunidade de fé, amor e esperança. Venha fazer parte da nossa família!',
   'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80',
   '/quem-somos', 'Conheça-nos', 0),
  ('Culto de Celebração',
   'Domingos às 9h e 19h. Venha adorar conosco!',
   'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80',
   '/eventos', 'Ver Programação', 1),
  ('Escola Bíblica Dominical',
   'Crescendo juntos no conhecimento da Palavra de Deus',
   'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=80',
   '/ministerios', 'Saiba Mais', 2)
) as v(title, subtitle, image_url, link, button_text, sort_order)
where not exists (select 1 from public.cms_banners);

insert into public.cms_ministerios (name, description, image_url, leader, leader_instagram, sort_order)
select * from (values
  ('Louvor e Adoração', 'Ministério dedicado à adoração através da música, conduzindo a igreja na presença de Deus.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', 'Lucas Barreto', 'https://www.instagram.com/lucasbarreto_0/', 0),
  ('Infantil', 'Cuidando e ensinando nossas crianças no caminho do Senhor com amor e dedicação.', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', 'Luana', null::text, 1),
  ('Jovens', 'Conectando a juventude a Cristo através de comunhão, ensino e missões.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', 'Carla Emanuele', 'https://www.instagram.com/carlalpcastro/', 2),
  ('Mulheres', 'Fortalecendo e capacitando mulheres para servir a Deus e à comunidade.', 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600&q=80', 'Sandra Barreto', null::text, 3),
  ('Homens', 'Edificando homens segundo o coração de Deus para liderar suas famílias.', 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80', 'Welder e Vitor', null::text, 4),
  ('Missões', 'Levando o evangelho além fronteiras, alcançando vidas para Cristo.', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80', 'Dirleide Granja', null::text, 5)
) as v(name, description, image_url, leader, leader_instagram, sort_order)
where not exists (select 1 from public.cms_ministerios);

insert into public.cms_eventos (title, description, date, time, location, category, image_url)
select * from (values
  ('Culto de Domingo', 'Venha celebrar conosco a cada domingo. Adoração, Palavra e comunhão.', '2026-04-26'::date, '09:00', 'Templo Principal', 'culto', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80'),
  ('Estudo Bíblico', 'Aprofunde-se na Palavra de Deus. Estudo expositivo do livro de Romanos.', '2026-04-22'::date, '19:30', 'Salão de Estudos', 'estudo', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80'),
  ('Batismo', 'Celebração de batismo. Novos membros declarando publicamente sua fé.', '2026-05-03'::date, '18:00', 'Templo Principal', 'batismo', 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80'),
  ('Encontro de Casais', 'Fortalecendo casamentos através da Palavra e comunhão.', '2026-05-10'::date, '19:00', 'Salão Social', 'encontro', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80'),
  ('Escola de Líderes', 'Capacitação para líderes de células e ministérios.', '2026-05-17'::date, '14:00', 'Sala de Treinamento', 'escola', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80'),
  ('Conferência de Missões', 'Anual conferência missionária com palestrantes internacionais.', '2026-06-15'::date, '19:00', 'Templo Principal', 'evento', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80')
) as v(title, description, date, time, location, category, image_url)
where not exists (select 1 from public.cms_eventos);

insert into public.cms_textos (key, value) values
  ('homeTitulo',          'Bem-vindo à Nossa Igreja'),
  ('homeSubtitulo',       'Somos uma comunidade de fé comprometida em amar a Deus e ao próximo'),
  ('versiculoDestaque',   'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.'),
  ('versiculoReferencia', 'João 3:16')
on conflict (key) do nothing;
