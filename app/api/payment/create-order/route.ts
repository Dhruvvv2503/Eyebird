export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { igUserId, email, promoCode } = await request.json();

    if (!igUserId || !email) {
      return NextResponse.json({ error: 'igUserId and email required' }, { status: 400 });
    }

    let amount = 29900; // ₹299 in paise

    // Re-validate promo server-side (never trust client)
    if (promoCode) {
      const { data: promo } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .single();

      if (
        promo &&
        promo.is_active &&
        (!promo.max_uses || promo.current_uses < promo.max_uses) &&
        (!promo.expires_at || new Date(promo.expires_at) > new Date())
      ) {
        if (promo.discount_type === 'flat') {
          amount = Math.max(100, 29900 - promo.flat_discount_amount);
        } else if (promo.discount_type === 'percent') {
          const discount = Math.floor(29900 * promo.discount_percent / 100);
          amount = 29900 - discount;
        }
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `eb_${igUserId.substring(0, 10)}_${Date.now()}`,
      notes: { igUserId, email, promoCode: promoCode || '' },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('[create-order] Error:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
