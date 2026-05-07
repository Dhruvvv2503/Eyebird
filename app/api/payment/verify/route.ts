export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, igUserId, auditId, email, promoCode, amount } =
      await request.json();

    if (!orderId || !paymentId || !signature || !igUserId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Razorpay signature — this is the security check, never skip
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[payment/verify] Signature mismatch for order:', orderId);
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Check for duplicate payment (idempotency)
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('razorpay_payment_id', paymentId)
      .single();

    if (existingPurchase) {
      // Already processed — return success (idempotent)
      return NextResponse.json({ success: true });
    }

    // 3. Get the audit record
    const { data: audit } = await supabaseAdmin
      .from('audits')
      .select('id')
      .eq('ig_user_id', igUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const resolvedAuditId = auditId || audit?.id || null;

    // 4. Mark specific audit as paid (not all audits for the user)
    const targetAuditId = resolvedAuditId;
    if (targetAuditId) {
      await supabaseAdmin
        .from('audits')
        .update({ is_paid: true, updated_at: new Date().toISOString() })
        .eq('id', targetAuditId);
    } else {
      // Fallback: mark latest audit
      await supabaseAdmin
        .from('audits')
        .update({ is_paid: true, updated_at: new Date().toISOString() })
        .eq('ig_user_id', igUserId)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    // 5. Record purchase
    const BASE = 9900; // ₹99 in paise
    const discountApplied = promoCode ? Math.max(0, BASE - (amount || BASE)) : 0;
    await supabaseAdmin.from('purchases').insert({
      audit_id: resolvedAuditId,
      ig_user_id: igUserId,
      email,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount_paid: amount || BASE,
      promo_code: promoCode || null,
      discount_applied: discountApplied,
    });


    // 6. Increment promo code usage atomically
    if (promoCode) {
      await supabaseAdmin.rpc('increment_promo_usage', {
        promo_code: promoCode.toUpperCase(),
      });
    }

    // 7. Send report email (fire-and-forget, don't block payment success)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    fetch(`${appUrl}/api/email/send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igUserId, email }),
    }).catch((err) => console.error('[payment/verify] Email trigger failed:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[payment/verify] Error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
