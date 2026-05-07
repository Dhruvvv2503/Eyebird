export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { igUserId, auditId } = await request.json();

    if (!igUserId) {
      return NextResponse.json({ error: 'igUserId required' }, { status: 400 });
    }

    let auditQuery = supabaseAdmin
      .from('audits')
      .select('*')
      .eq('ig_user_id', igUserId);

    // If specific auditId requested, fetch that exact one
    if (auditId) {
      auditQuery = auditQuery.eq('id', auditId);
    } else {
      auditQuery = auditQuery.order('created_at', { ascending: false }).limit(1);
    }

    const { data: audit, error: auditError } = await auditQuery.single();

    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const { data: account } = await supabaseAdmin
      .from('instagram_accounts')
      .select('username, followers_count, profile_picture_url, biography, media_count')
      .eq('ig_user_id', igUserId)
      .single();

    return NextResponse.json({ audit, account });
  } catch (err) {
    console.error('[audit/fetch] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch audit data' }, { status: 500 });
  }
}
