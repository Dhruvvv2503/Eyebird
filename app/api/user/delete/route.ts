export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any));
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Delete in dependency order
    await supabaseAdmin.from('automation_logs').delete().eq('user_id', userId);
    await supabaseAdmin.from('contacts').delete().eq('user_id', userId);
    await supabaseAdmin.from('automations').delete().eq('user_id', userId);
    await supabaseAdmin.from('audits').delete().eq('user_id', userId);
    await supabaseAdmin.from('ig_raw_data').delete().eq('user_id', userId);
    await supabaseAdmin.from('purchases').delete().eq('user_id', userId);
    await supabaseAdmin.from('instagram_accounts').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_profiles').delete().eq('id', userId);

    await supabase.auth.signOut();
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[user/delete] error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
