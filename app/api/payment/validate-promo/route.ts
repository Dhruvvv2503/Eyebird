export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, baseAmount } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'No code provided' });
    }

    // In a real app, query the promo_codes table
    // For this build, we mock the LAUNCH code
    if (code === 'LAUNCH') {
      const discountAmount = 200;
      const finalAmount = Math.max(0, baseAmount - discountAmount);
      
      return NextResponse.json({
        valid: true,
        discountType: 'flat',
        discountAmount,
        finalAmount,
        message: `₹${discountAmount} off applied! You pay ₹${finalAmount}.`
      });
    }

    return NextResponse.json({ valid: false, message: 'Invalid or expired code' });
  } catch (error) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
