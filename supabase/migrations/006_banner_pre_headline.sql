-- =========================================================================
-- Migration 006 — Pré-headline editável nos banners (Phase 10.9)
-- =========================================================================
-- Adiciona coluna `pre_headline text` nullable em `cms_banners`.
-- Antes, o eyebrow mostrava UUID do Supabase. Agora é texto livre
-- ou omitido quando vazio.
--
-- 100% IDEMPOTENTE.
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_banners'
      AND column_name = 'pre_headline'
  ) THEN
    ALTER TABLE public.cms_banners ADD COLUMN pre_headline text;
  END IF;
END $$;
