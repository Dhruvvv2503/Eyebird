export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, igUserId, auditId, email, promoCode } = await request.json();

    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature is valid.
    // In a real app:
    // 1. Update `audits` table `is_paid = true`
    // 2. Insert into `purchases` table
    // 3. Decrement promo code usage
    // 4. Trigger PDF generation async

    // Mock successful verification
    console.log(`Payment verified for ${email}, audit: ${auditId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
