/**
 * Typed, validated environment variable accessors for Eyebird.
 * Use these helpers in all API routes instead of process.env directly.
 * Missing vars become handled errors/fallbacks, never runtime crashes.
 */

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[env] NEXT_PUBLIC_APP_URL is not set in production — falling back to eyebird.in');
      return 'https://eyebird.in';
    }
    return 'http://localhost:3000';
  }
  return url.replace(/\/$/, ''); // strip trailing slash
}

export function getInstagramAppId(): string | null {
  return process.env.INSTAGRAM_APP_ID || null;
}

export function getInstagramAppSecret(): string | null {
  return process.env.INSTAGRAM_APP_SECRET || null;
}

export function getInstagramRedirectUri(): string {
  const explicit = process.env.INSTAGRAM_REDIRECT_URI;
  if (explicit) return explicit;
  return `${getAppUrl()}/api/instagram/callback`;
}

export function getRazorpayKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID || null;
}

export function getRazorpayKeySecret(): string | null {
  return process.env.RAZORPAY_KEY_SECRET || null;
}

export function getSupabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || null;
}

export function getAnthropicKey(): string | null {
  return process.env.ANTHROPIC_API_KEY || null;
}

export function getResendKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

export function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}
