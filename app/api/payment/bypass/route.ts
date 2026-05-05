export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { igUserId, auditId, email } = await request.json();

    if (!igUserId || !email) {
      return NextResponse.json({ error: 'igUserId and email required' }, { status: 400 });
    }

    // Save email for marketing
    await supabaseAdmin
      .from('instagram_accounts')
      .update({ email })
      .eq('ig_user_id', igUserId);

    // Mark audit as paid
    await supabaseAdmin
      .from('audits')
      .update({ is_paid: true, updated_at: new Date().toISOString() })
      .eq('ig_user_id', igUserId);

    // Record as a free unlock in purchases (for tracking)
    const { data: audit } = await supabaseAdmin
      .from('audits')
      .select('id')
      .eq('ig_user_id', igUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    await supabaseAdmin.from('purchases').insert({
      audit_id: auditId || audit?.id || null,
      ig_user_id: igUserId,
      email,
      razorpay_order_id: `free_${Date.now()}`,
      razorpay_payment_id: `free_${Date.now()}`,
      amount_paid: 0,
      promo_code: 'FREE_BYPASS',
      discount_applied: 0,
    }).maybeSingle(); // ignore if duplicate

    // Send report email (fire-and-forget)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    fetch(`${appUrl}/api/email/send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igUserId, email }),
    }).catch((err) => console.error('[bypass] Email trigger failed:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[payment/bypass] Error:', err);
    return NextResponse.json({ error: 'Failed to unlock report' }, { status: 500 });
  }
}
