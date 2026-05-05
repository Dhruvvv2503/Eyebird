-- ================================================================
-- Eyebird Database Schema
-- Run this in Supabase: Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- Instagram connected accounts
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  followers_count INTEGER DEFAULT 0,
  profile_picture_url TEXT,
  biography TEXT,
  media_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Raw Instagram data cache
CREATE TABLE IF NOT EXISTS ig_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id TEXT UNIQUE NOT NULL,
  profile_data JSONB,
  media_data JSONB,
  insights_data JSONB,
  audience_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Computed audit results
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  computed_metrics JSONB NOT NULL DEFAULT '{}',
  ai_analysis JSONB NOT NULL DEFAULT '{}',
  overall_score INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment records
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id),
  ig_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  amount_paid INTEGER NOT NULL,
  promo_code TEXT,
  discount_applied INTEGER DEFAULT 0,
  paid_at TIMESTAMPTZ DEFAULT now()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'flat',
  flat_discount_amount INTEGER DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert launch promo code (₹200 off — ₹299 becomes ₹99)
INSERT INTO promo_codes (code, discount_type, flat_discount_amount, max_uses, is_active)
VALUES ('LAUNCH', 'flat', 20000, 500, true)
ON CONFLICT (code) DO NOTHING;
