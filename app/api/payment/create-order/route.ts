export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Razorpay from 'razorpay';

const BASE_PRICE_PAISE = 9900; // ₹99

export async function POST(request: NextRequest) {
  try {
    const { igUserId, email, amount } = await request.json();

    if (!igUserId || !email) {
      return NextResponse.json({ error: 'igUserId and email required' }, { status: 400 });
    }

    const finalAmount = typeof amount === 'number' && amount >= 100 ? amount : BASE_PRICE_PAISE;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: 'INR',
      receipt: `eb_${igUserId.substring(0, 10)}_${Date.now()}`,
      notes: { igUserId, email },
    });

    // Save email for marketing
    await supabaseAdmin
      .from('instagram_accounts')
      .update({ email })
      .eq('ig_user_id', igUserId);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    // Log full Razorpay error for debugging
    const rzpError = err?.error || err;
    console.error('[create-order] Razorpay error:', JSON.stringify(rzpError, null, 2));
    return NextResponse.json({
      error: 'Failed to create payment order',
      // Return Razorpay's actual error description so it shows in the UI
      detail: rzpError?.description || rzpError?.message || String(err),
      code: rzpError?.code || null,
    }, { status: 500 });
  }
}
