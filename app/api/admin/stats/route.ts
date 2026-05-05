export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function checkAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  return token === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // ── Audits: total, paid, this week, this month ──
    const { data: audits } = await supabaseAdmin
      .from('audits')
      .select('id, username, overall_score, is_paid, created_at, updated_at, computed_metrics');

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const total = audits?.length ?? 0;
    const paid = audits?.filter(a => a.is_paid).length ?? 0;
    const thisWeek = audits?.filter(a => new Date(a.created_at) >= weekAgo).length ?? 0;
    const thisMonth = audits?.filter(a => new Date(a.created_at) >= monthAgo).length ?? 0;

    // Avg score
    const scores = (audits ?? []).map(a => a.overall_score).filter(Boolean);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Daily breakdown last 14 days
    const dailyMap: Record<string, { audits: number; unlocks: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { audits: 0, unlocks: 0 };
    }
    (audits ?? []).forEach(a => {
      const key = a.created_at?.slice(0, 10);
      if (key && dailyMap[key]) {
        dailyMap[key].audits++;
        if (a.is_paid) dailyMap[key].unlocks++;
      }
    });
    const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

    // ── Purchases / emails ──
    const { data: purchases } = await supabaseAdmin
      .from('purchases')
      .select('id, email, ig_user_id, amount_paid, promo_code, paid_at')
      .order('paid_at', { ascending: false })
      .limit(200);

    const totalEmails = new Set((purchases ?? []).map(p => p.email).filter(Boolean)).size;
    const totalRevenue = (purchases ?? []).reduce((s, p) => s + (p.amount_paid ?? 0), 0);

    // ── Recent audits (last 20) ──
    const recent = (audits ?? [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map(a => ({
        id: a.id,
        username: a.username,
        score: a.overall_score,
        is_paid: a.is_paid,
        followers: a.computed_metrics?.followers ?? 0,
        created_at: a.created_at,
      }));

    // ── Promo codes ──
    const { data: promos } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      stats: { total, paid, thisWeek, thisMonth, avgScore, totalEmails, totalRevenue, conversionRate: total ? Math.round((paid / total) * 100) : 0 },
      daily,
      recent,
      promos: promos ?? [],
      recentPurchases: (purchases ?? []).slice(0, 15),
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
