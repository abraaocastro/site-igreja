-- =========================================================================
-- Migration 007 — Horário de término em eventos
-- =========================================================================
-- Adiciona coluna `end_time text` com default '20:00' em `cms_eventos`.
-- O contador da home usa esse campo para saber quando o evento acabou
-- e pular para o próximo.
--
-- 100% IDEMPOTENTE.
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_eventos'
      AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.cms_eventos ADD COLUMN end_time text NOT NULL DEFAULT '20:00';
  END IF;
END $$;
