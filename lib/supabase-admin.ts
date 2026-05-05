import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client — uses service_role key, bypasses Row Level Security.
 * NEVER expose this on the client side.
 * Use only in API routes and server components.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
