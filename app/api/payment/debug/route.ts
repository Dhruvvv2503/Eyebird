export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// Temporary debug route — DELETE after fixing payment issue
export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID || 'NOT SET';
  const secret = process.env.RAZORPAY_KEY_SECRET || 'NOT SET';
  const pubKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'NOT SET';

  return NextResponse.json({
    RAZORPAY_KEY_ID: keyId.substring(0, 12) + '...' + keyId.slice(-4),
    RAZORPAY_KEY_SECRET: secret.substring(0, 4) + '...' + secret.slice(-4),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: pubKeyId.substring(0, 12) + '...' + pubKeyId.slice(-4),
    isLive: keyId.startsWith('rzp_live_'),
    isTest: keyId.startsWith('rzp_test_'),
  });
}
