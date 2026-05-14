-- =========================================================================
-- Migration 010 — Archived flag em eventos (Phase 11.7)
-- =========================================================================
-- Adiciona `archived boolean DEFAULT false` em `cms_eventos`.
-- Eventos com mais de 90 dias são arquivados (manual ou via batch).
-- Queries públicas filtram `WHERE archived = false`.
--
-- 100% IDEMPOTENTE.
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_eventos'
      AND column_name = 'archived'
  ) THEN
    ALTER TABLE public.cms_eventos ADD COLUMN archived boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Index para filtrar rapidamente os não-arquivados
CREATE INDEX IF NOT EXISTS cms_eventos_archived_idx
  ON public.cms_eventos (archived) WHERE archived = false;

-- Auto-archive: marcar como archived eventos com date < hoje - 90 dias
UPDATE public.cms_eventos
SET archived = true
WHERE archived = false
  AND date::date < (CURRENT_DATE - INTERVAL '90 days');
