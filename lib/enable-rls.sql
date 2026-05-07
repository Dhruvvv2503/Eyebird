-- ================================================================
-- Eyebird — Row Level Security
-- Run AFTER database.sql in: Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Enable RLS on all tables (explicit public schema)
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_raw_data        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes        ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing accidental public policies
DROP POLICY IF EXISTS "public_read_instagram_accounts" ON public.instagram_accounts;
DROP POLICY IF EXISTS "public_read_ig_raw_data"        ON public.ig_raw_data;
DROP POLICY IF EXISTS "public_read_audits"             ON public.audits;
DROP POLICY IF EXISTS "public_read_purchases"          ON public.purchases;
DROP POLICY IF EXISTS "public_read_promo_codes"        ON public.promo_codes;

-- Done. Service role key (used in Next.js API routes) bypasses RLS automatically.
-- Anon/public access is now fully blocked on all tables.
