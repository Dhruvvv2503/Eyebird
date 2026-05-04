export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, igUserId, email, promoCode } = await request.json();

    if (!amount || !igUserId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify promo code again on the server if provided
    let finalAmount = amount;
    if (promoCode) {
      // In a real app, query the database
      // const { data } = await supabase.from('promo_codes').select('*').eq('code', promoCode).single();
      if (promoCode === 'LAUNCH') {
        finalAmount = 9900; // ₹99
      }
    }

    // Ensure final amount matches what we expect
    if (finalAmount !== amount) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: finalAmount,
      currency: 'INR',
      receipt: `rcpt_${igUserId.substring(0, 8)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
