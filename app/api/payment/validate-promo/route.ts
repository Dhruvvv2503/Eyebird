export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const BASE_PRICE_PAISE = 9900; // ₹99

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' });
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Promo code has expired' });
    }

    // Check max uses
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: 'Promo code usage limit reached' });
    }

    let finalAmount = BASE_PRICE_PAISE;
    let discountAmount = 0;
    let discountLabel = '';

    if (promo.discount_type === 'free') {
      finalAmount = 0; discountAmount = BASE_PRICE_PAISE; discountLabel = '100% off';
    } else if (promo.discount_type === 'percent') {
      discountAmount = Math.round(BASE_PRICE_PAISE * promo.discount_percent / 100);
      finalAmount = BASE_PRICE_PAISE - discountAmount;
      discountLabel = `${promo.discount_percent}% off`;
    } else if (promo.discount_type === 'flat') {
      discountAmount = promo.flat_discount_amount;
      finalAmount = Math.max(0, BASE_PRICE_PAISE - discountAmount);
      discountLabel = `₹${Math.round(discountAmount / 100)} off`;
    }

    return NextResponse.json({ valid: true, code: promo.code, discountLabel, discountAmount, finalAmount, isFree: finalAmount === 0 });
  } catch (err) {
    console.error('[validate-promo]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
