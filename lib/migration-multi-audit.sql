-- ================================================================
-- Eyebird Multi-Audit Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- PURPOSE: Allow multiple audits per user (needed for history/comparison)
-- ================================================================

-- 1. Remove UNIQUE constraint on audits.ig_user_id
--    (currently only ONE audit per user is stored — this breaks history)
ALTER TABLE public.audits DROP CONSTRAINT IF EXISTS audits_ig_user_id_key;

-- 2. Add regular indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_audits_ig_user_id ON public.audits(ig_user_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_user_date  ON public.audits(ig_user_id, created_at DESC);

-- Done. Each new audit run now creates a separate row.
-- Existing audits are preserved unchanged.
