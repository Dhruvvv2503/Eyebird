-- ================================================================
-- Eyebird Database Functions
-- Run AFTER database.sql in Supabase SQL Editor
-- ================================================================

-- Safely increment promo code usage (atomic, prevents race conditions)
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = promo_code AND is_active = true;
END;
$$ LANGUAGE plpgsql;
