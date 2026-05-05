export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'No code provided' });
    }

    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired code' });
    }

    if (!promo.is_active) {
      return NextResponse.json({ valid: false, message: 'This code is no longer active' });
    }

    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ valid: false, message: 'This code has reached its usage limit' });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This code has expired' });
    }

    // Calculate final amount (in paise)
    const baseAmount = 29900; // ₹299
    let discountAmount = 0;
    let finalAmount = baseAmount;

    if (promo.discount_type === 'flat') {
      discountAmount = promo.flat_discount_amount;
      finalAmount = Math.max(100, baseAmount - discountAmount); // min ₹1
    } else if (promo.discount_type === 'percent') {
      discountAmount = Math.floor(baseAmount * promo.discount_percent / 100);
      finalAmount = baseAmount - discountAmount;
    }

    return NextResponse.json({
      valid: true,
      discountType: promo.discount_type,
      discountAmount,
      finalAmount,
      message: `Code applied! You save ₹${Math.floor(discountAmount / 100)}`,
    });
  } catch (err) {
    console.error('[validate-promo] Error:', err);
    return NextResponse.json({ valid: false, message: 'Could not validate code. Try again.' });
  }
}
