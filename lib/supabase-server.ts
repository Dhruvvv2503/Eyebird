import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using Service Role key.
 * Only use in API routes (server-side). Never expose to the client.
 */
export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export default getSupabaseServer;
