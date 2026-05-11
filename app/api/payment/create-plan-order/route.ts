export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Razorpay from 'razorpay';

const CREATOR_PLAN_PRICE = 79900; // ₹799 in paise

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any)
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user;
    const { promoCode } = await req.json();

    let finalAmount = CREATOR_PLAN_PRICE;
    let discountApplied = 0;
    let promoData: Record<string, unknown> | null = null;

    if (promoCode) {
      const { data: promo, error } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('code', (promoCode as string).trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
      }
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
      }
      if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
        return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
      }

      promoData = promo;

      if (promo.discount_type === 'free') {
        finalAmount = 0;
        discountApplied = CREATOR_PLAN_PRICE;
      } else if (promo.discount_type === 'percent') {
        discountApplied = Math.round(CREATOR_PLAN_PRICE * promo.discount_percent / 100);
        finalAmount = CREATOR_PLAN_PRICE - discountApplied;
      } else if (promo.discount_type === 'flat') {
        discountApplied = promo.flat_discount_amount;
        finalAmount = Math.max(0, CREATOR_PLAN_PRICE - discountApplied);
      }
    }

    // 100% off — bypass Razorpay, upgrade directly
    if (finalAmount === 0) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await supabaseAdmin
        .from('user_profiles')
        .update({
          plan: 'creator',
          plan_started_at: new Date().toISOString(),
          plan_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id);

      await supabaseAdmin.from('purchases').insert({
        user_id: user.id,
        ig_user_id: user.id,
        email: user.email ?? '',
        razorpay_order_id: `free_plan_${Date.now()}`,
        razorpay_payment_id: `bypass_plan_${user.id}_${Date.now()}`,
        amount_paid: 0,
        promo_code: promoCode ? (promoCode as string).trim().toUpperCase() : null,
        discount_applied: discountApplied,
        plan_type: 'creator',
        plan_expires_at: expiresAt.toISOString(),
      });

      if (promoData) {
        await supabaseAdmin.rpc('increment_promo_usage', {
          promo_code: (promoCode as string).trim().toUpperCase(),
        });
      }

      return NextResponse.json({ success: true, bypassed: true, message: 'Creator Plan activated' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: 'INR',
      receipt: `plan_${user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        email: user.email ?? '',
        planType: 'creator',
        promoCode: promoCode ?? '',
        discountApplied: String(discountApplied),
        originalAmount: String(CREATOR_PLAN_PRICE),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
      originalAmount: CREATOR_PLAN_PRICE,
      discountApplied,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    console.error('[create-plan-order]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
