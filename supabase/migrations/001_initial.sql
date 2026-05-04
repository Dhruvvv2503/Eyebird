-- ═══════════════════════════════════════════════
-- Creatiq Database Migration — 001 Initial Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Instagram Connected Accounts ───
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ig_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  followers_count INTEGER,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Raw Instagram Data Cache ───
CREATE TABLE IF NOT EXISTS ig_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id TEXT NOT NULL,
  profile_data JSONB,
  media_data JSONB,
  insights_data JSONB,
  audience_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS ig_raw_data_ig_user_id_idx ON ig_raw_data(ig_user_id);
CREATE INDEX IF NOT EXISTS ig_raw_data_fetched_at_idx ON ig_raw_data(fetched_at);

-- ─── Computed Audit Results ───
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  computed_metrics JSONB NOT NULL,
  ai_analysis JSONB NOT NULL,
  overall_score INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audits_ig_user_id_idx ON audits(ig_user_id);
CREATE INDEX IF NOT EXISTS audits_created_at_idx ON audits(created_at);

-- ─── Payment Records ───
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  ig_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount_paid INTEGER NOT NULL,
  promo_code TEXT,
  discount_applied INTEGER DEFAULT 0,
  paid_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Promo Codes ───
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  flat_discount_amount INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Insert Launch Promo Code ───
-- LAUNCH: flat ₹200 off (₹299 → ₹99), max 500 uses
INSERT INTO promo_codes (code, discount_percent, flat_discount_amount, max_uses, is_active)
VALUES ('LAUNCH', 0, 20000, 500, true)
ON CONFLICT (code) DO NOTHING;

-- ─── Row Level Security (Optional but recommended) ───
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role)
-- Public access for audits (needed for report page)
CREATE POLICY "Public can read audits by ig_user_id"
  ON audits FOR SELECT
  USING (true);

-- ─── Supabase Storage ───
-- Create bucket: audit-reports (public)
-- Run this manually in Storage UI or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audit-reports', 'audit-reports', true);
