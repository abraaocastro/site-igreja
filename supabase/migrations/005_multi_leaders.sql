-- =========================================================================
-- Migration 005 — Múltiplos líderes por ministério (Phase 10.4)
-- =========================================================================
-- Substitui `leader text` + `leader_instagram text` por `leaders jsonb`.
-- Formato: [{ "name": "Lucas Barreto", "instagram": "https://..." }, ...]
--
-- Backfill: converte a linha existente num array de 1 elemento.
-- Drop das colunas antigas só depois do backfill.
--
-- 100% IDEMPOTENTE. Pode rodar várias vezes.
-- =========================================================================

-- 1. Adicionar coluna leaders se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_ministerios'
      AND column_name = 'leaders'
  ) THEN
    ALTER TABLE public.cms_ministerios ADD COLUMN leaders jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. Backfill: se leaders está vazio E leader text existe, migra
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_ministerios'
      AND column_name = 'leader'
  ) THEN
    UPDATE public.cms_ministerios
    SET leaders = jsonb_build_array(
      jsonb_build_object(
        'name', COALESCE(leader, ''),
        'instagram', leader_instagram
      )
    )
    WHERE leaders = '[]'::jsonb
      AND (leader IS NOT NULL AND leader <> '');
  END IF;
END $$;

-- 3. Drop colunas antigas (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_ministerios'
      AND column_name = 'leader'
  ) THEN
    ALTER TABLE public.cms_ministerios DROP COLUMN leader;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_ministerios'
      AND column_name = 'leader_instagram'
  ) THEN
    ALTER TABLE public.cms_ministerios DROP COLUMN leader_instagram;
  END IF;
END $$;
