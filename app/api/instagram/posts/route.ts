export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    const { data: igAccount, error: igError } = await supabaseAdmin
      .from('instagram_accounts')
      .select('access_token, ig_user_id')
      .eq('user_id', userId)
      .single();

    if (igError || !igAccount) {
      return NextResponse.json({ error: 'No Instagram account' }, { status: 400 });
    }

    let url = `https://graph.instagram.com/v21.0/${igAccount.ig_user_id}/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=9&access_token=${igAccount.access_token}`;

    if (cursor) {
      url += `&after=${cursor}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({
      posts: data.data || [],
      nextCursor: data.paging?.cursors?.after || null,
      hasMore: !!data.paging?.next,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
