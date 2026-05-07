export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

/**
 * Razorpay Webhook Handler
 * URL to paste in Razorpay Dashboard: https://[your-domain]/api/payment/webhook
 * Events to select: payment.captured
 *
 * This is a server-to-server callback from Razorpay — runs even if the user
 * closed their browser tab before the frontend verify call completed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      if (expected !== signature) {
        console.error('[webhook] Signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    // Only handle payment.captured
    if (eventType !== 'payment.captured') {
      return NextResponse.json({ status: 'ignored' });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
      return NextResponse.json({ error: 'No payment entity' }, { status: 400 });
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;
    const notes = payment.notes || {};
    const igUserId = notes.igUserId;
    const email = notes.email;

    if (!paymentId || !igUserId) {
      console.error('[webhook] Missing paymentId or igUserId in notes');
      return NextResponse.json({ status: 'skipped' });
    }

    // Check for duplicate (idempotent)
    const { data: existing } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('razorpay_payment_id', paymentId)
      .single();

    if (existing) {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Get latest audit for this user
    const { data: audit } = await supabaseAdmin
      .from('audits')
      .select('id')
      .eq('ig_user_id', igUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Mark audit as paid
    if (audit?.id) {
      await supabaseAdmin
        .from('audits')
        .update({ is_paid: true, updated_at: new Date().toISOString() })
        .eq('id', audit.id);
    }

    // Record purchase
    await supabaseAdmin.from('purchases').insert({
      audit_id: audit?.id || null,
      ig_user_id: igUserId,
      email: email || '',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount_paid: payment.amount || 9900,
      promo_code: null,
      discount_applied: 0,
    });

    console.log(`[webhook] payment.captured processed: ${paymentId} for ${igUserId}`);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
