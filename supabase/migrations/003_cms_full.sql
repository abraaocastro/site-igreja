-- =========================================================================
-- Migration 003 — CMS completo (Phase 9)
-- =========================================================================
-- Adiciona o que faltava pra admin editar TODA informação do site:
--   - cms_historia: timeline da página /historia (year/title/description/image)
--   - cms_textos ganha mais chaves: pastor, igreja, contato, socials, pix
--     (chaves novas, sem schema change — KV existente continua sendo usado)
--
-- 100% IDEMPOTENTE. Pode rodar várias vezes.
-- =========================================================================

-- ---------- 1. cms_historia (timeline) ----------

create table if not exists public.cms_historia (
  id           uuid          primary key default gen_random_uuid(),
  year         text          not null,
  title        text          not null,
  description  text          not null default '',
  image_url    text,
  sort_order   int           not null default 0,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

comment on table public.cms_historia is 'Timeline da página /historia. Cada linha é um marco histórico.';

create index if not exists cms_historia_sort_idx on public.cms_historia (sort_order, created_at);

alter table public.cms_historia enable row level security;

drop policy if exists "cms_historia_read_all"      on public.cms_historia;
drop policy if exists "cms_historia_writer_insert" on public.cms_historia;
drop policy if exists "cms_historia_writer_update" on public.cms_historia;
drop policy if exists "cms_historia_writer_delete" on public.cms_historia;

create policy "cms_historia_read_all"
  on public.cms_historia for select
  to anon, authenticated
  using (true);

create policy "cms_historia_writer_insert"
  on public.cms_historia for insert
  to authenticated
  with check (public.is_cms_writer());

create policy "cms_historia_writer_update"
  on public.cms_historia for update
  to authenticated
  using (public.is_cms_writer())
  with check (public.is_cms_writer());

create policy "cms_historia_writer_delete"
  on public.cms_historia for delete
  to authenticated
  using (public.is_cms_writer());

drop trigger if exists cms_historia_updated on public.cms_historia;
create trigger cms_historia_updated before update on public.cms_historia
  for each row execute procedure public.handle_updated_at();

-- ---------- 2. Seeds da timeline ----------
-- Conteúdo padrão a partir do que vivia hardcoded em /historia/page.tsx.

insert into public.cms_historia (year, title, description, image_url, sort_order)
select * from (values
  ('1970', 'A Semente é Plantada', 'Um pequeno grupo de famílias começou a se reunir em uma casa para estudar a Bíblia e orar. A semente do Evangelho foi plantada em Capim Grosso.', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80', 0),
  ('1972', 'Organização da Igreja', 'Com o crescimento do grupo, a igreja foi oficialmente organizada como Primeira Igreja Batista de Capim Grosso, filiada à Convenção Batista Brasileira.', 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80', 1),
  ('1980', 'Construção do Templo', 'Através de muito esforço e dedicação dos membros, foi construído o primeiro templo da igreja, um marco na história da congregação.', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', 2),
  ('1995', 'Expansão dos Ministérios', 'A igreja expandiu seus ministérios, criando trabalhos específicos para jovens, crianças, mulheres e homens, fortalecendo a comunidade.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', 3),
  ('2005', 'Ampliação do Templo', 'Com o crescimento contínuo, o templo foi ampliado para acomodar mais pessoas e criar novos espaços para atividades da igreja.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', 4),
  ('2015', 'Centro de Educação Cristã', 'Foi inaugurado o Centro de Educação Cristã, oferecendo espaço para Escola Bíblica Dominical e treinamento de líderes.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', 5),
  ('2020', 'Igreja Online', 'Durante a pandemia, a igreja se adaptou e começou a transmitir cultos online, alcançando pessoas além das fronteiras da cidade.', 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600&q=80', 6),
  ('Hoje', 'Continuando a Missão', 'Hoje, a PIB Capim Grosso continua firme em sua missão, com centenas de membros, diversos ministérios ativos e projetos sociais na comunidade.', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80', 7)
) as v(year, title, description, image_url, sort_order)
where not exists (select 1 from public.cms_historia);

-- =========================================================================
-- Após rodar este SQL, novos CHAVES em cms_textos passam a ser editáveis
-- pelo admin (sem schema change — só são keys novas no KV existente):
--
--   pastorNome, pastorTitulo, pastorBio, pastorFoto, pastorInstagram
--   igrejaNome, igrejaNomeCurto, igrejaSlogan
--   enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade,
--   enderecoEstado, enderecoCep
--   contatoTelefone, contatoWhatsapp, contatoEmail
--   socialInstagram, socialInstagramPastor, socialInstagramJovens,
--   socialFacebook, socialYoutube
--   pixChave, pixTipo, pixTitular
--   historiaIntroTitulo, historiaIntroSubtitulo, historiaIntroTexto
--   historiaCitacao, historiaCitacaoRef, historiaCitacaoTexto
--
-- Quando o admin grava qualquer um desses, o site usa o valor do banco.
-- Quando está vazio/null, cai pro default em data/church.json.
-- =========================================================================
