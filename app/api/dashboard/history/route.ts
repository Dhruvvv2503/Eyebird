export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/dashboard/history?igUserId=xxx
export async function POST(request: NextRequest) {
  try {
    const { igUserId } = await request.json();

    if (!igUserId) {
      return NextResponse.json({ error: 'igUserId required' }, { status: 400 });
    }

    // Fetch all audits for this user, latest first
    const { data: audits, error } = await supabaseAdmin
      .from('audits')
      .select('id, overall_score, computed_metrics, ai_analysis, is_paid, created_at, username')
      .eq('ig_user_id', igUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[dashboard/history] DB error:', error);
      return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
    }

    // Fetch account profile
    const { data: account } = await supabaseAdmin
      .from('instagram_accounts')
      .select('username, followers_count, profile_picture_url, biography, media_count')
      .eq('ig_user_id', igUserId)
      .single();

    return NextResponse.json({ audits: audits || [], account });
  } catch (err) {
    console.error('[dashboard/history] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
