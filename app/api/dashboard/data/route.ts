export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [profileResult, igResult] = await Promise.allSettled([
      supabaseAdmin
        .from('user_profiles')
        .select('full_name, avatar_url, plan, onboarding_completed')
        .eq('id', userId)
        .single(),
      supabaseAdmin
        .from('instagram_accounts')
        .select('ig_user_id, username, profile_picture_url, followers_count, token_expires_at')
        .eq('user_id', userId)
        .single(),
    ]);

    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
    const igAccount = igResult.status === 'fulfilled' ? igResult.value.data : null;

    let audits: any[] = [];
    if (igAccount?.ig_user_id) {
      const { data } = await supabaseAdmin
        .from('audits')
        .select('id, overall_score, computed_metrics, ai_analysis, created_at, username, is_paid')
        .eq('ig_user_id', igAccount.ig_user_id)
        .order('created_at', { ascending: false })
        .limit(12);
      audits = data || [];
    }

    return NextResponse.json({
      profile,
      igAccount,
      audits,
      user: {
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name,
        avatar_url: session.user.user_metadata?.avatar_url,
      },
    });
  } catch (err) {
    console.error('[dashboard/data] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
