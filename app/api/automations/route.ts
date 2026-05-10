export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { data: automations, error } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ automations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const body = await req.json();

    const { data: igAccount, error: igError } = await supabaseAdmin
      .from('instagram_accounts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (igError || !igAccount) {
      return NextResponse.json({ error: 'No Instagram account connected' }, { status: 400 });
    }

    const { data: automation, error } = await supabaseAdmin
      .from('automations')
      .insert({
        user_id: userId,
        ig_account_id: igAccount.id,
        name: body.name || 'Untitled Automation',
        status: body.status || 'draft',
        trigger_post_id: body.trigger_post_id || null,
        trigger_post_url: body.trigger_post_url || null,
        trigger_post_thumbnail: body.trigger_post_thumbnail || null,
        trigger_keywords: body.trigger_keywords || [],
        trigger_any_word: body.trigger_any_word || false,
        reply_to_comment_publicly: body.reply_to_comment_publicly || false,
        opening_dm_enabled: body.opening_dm_enabled || false,
        opening_dm_text: body.opening_dm_text || null,
        follow_gate_enabled: body.follow_gate_enabled || false,
        main_dm_text: body.main_dm_text || '',
        main_dm_link_text: body.main_dm_link_text || null,
        main_dm_link_url: body.main_dm_link_url || null,
        test_mode: true,
        test_instagram_username: 'dhruvv.bhaii',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ automation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
