export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Razorpay from 'razorpay';

const LAUNCH_PRICE_PAISE = 9900; // ₹99

export async function POST(request: NextRequest) {
  try {
    const { igUserId, email } = await request.json();

    if (!igUserId || !email) {
      return NextResponse.json({ error: 'igUserId and email required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: LAUNCH_PRICE_PAISE,
      currency: 'INR',
      receipt: `eb_${igUserId.substring(0, 10)}_${Date.now()}`,
      notes: { igUserId, email },
    });

    // Also save email to instagram_accounts for marketing
    await supabaseAdmin
      .from('instagram_accounts')
      .update({ email })
      .eq('ig_user_id', igUserId);

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
