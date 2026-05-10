export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any)
          );
        },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { data: igAccount } = await supabaseAdmin
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!igAccount) {
      return NextResponse.json({ error: 'No Instagram account' }, { status: 400 });
    }

    const response = await fetch(
      `https://graph.instagram.com/v21.0/${igAccount.ig_user_id}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${igAccount.access_token}`,
        },
        body: JSON.stringify({
          subscribed_fields: 'comments',
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Webhook subscription error:', data.error);
      return NextResponse.json({
        error: data.error.message,
        note: 'Webhook subscription failed — this is expected if instagram_manage_comments permission is not yet approved. The automation is saved and will work once approved.',
      }, { status: 400 });
    }

    console.log('Webhook subscribed successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
