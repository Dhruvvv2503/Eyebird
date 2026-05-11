export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      promoCode,
      discountApplied,
      amountPaid,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[verify-plan] Signature mismatch for order:', razorpay_order_id);
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Idempotency check
    const { data: existing } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Upgrade plan
    await supabaseAdmin
      .from('user_profiles')
      .update({
        plan: 'creator',
        plan_started_at: new Date().toISOString(),
        plan_expires_at: expiresAt.toISOString(),
        razorpay_subscription_id: razorpay_payment_id,
      })
      .eq('id', user.id);

    // Record purchase
    await supabaseAdmin.from('purchases').insert({
      user_id: user.id,
      ig_user_id: user.id,
      email: user.email ?? '',
      razorpay_order_id,
      razorpay_payment_id,
      amount_paid: amountPaid ?? 79900,
      promo_code: promoCode ?? null,
      discount_applied: discountApplied ?? 0,
      plan_type: 'creator',
      plan_expires_at: expiresAt.toISOString(),
    });

    // Increment promo usage atomically
    if (promoCode) {
      await supabaseAdmin.rpc('increment_promo_usage', {
        promo_code: (promoCode as string).toUpperCase(),
      });
    }

    // Confirmation email — fire-and-forget
    const expiryLabel = expiresAt.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    resend.emails.send({
      from: 'Eyebird <noreply@eyebird.in>',
      to: [user.email!],
      subject: 'Welcome to Creator Plan — Eyebird',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#07060F;color:#fff;padding:40px 32px;border-radius:16px">
          <h2 style="font-size:24px;font-weight:800;margin:0 0 8px">You're on Creator Plan</h2>
          <p style="color:rgba(255,255,255,0.5);margin:0 0 24px">Your account has been upgraded.</p>
          <p style="margin:0 0 6px"><strong>Plan expires:</strong> ${expiryLabel}</p>
          <ul style="color:rgba(255,255,255,0.7);padding-left:20px;line-height:2">
            <li>Unlimited DM automations — no monthly caps</li>
            <li>All 22 audit metrics unlocked</li>
            <li>Smart Reply AI inbox</li>
            <li>Monthly re-audit to track growth</li>
            <li>Priority support in Indian timezone</li>
          </ul>
          <a href="https://www.eyebird.in/dashboard" style="display:inline-block;margin-top:24px;padding:12px 24px;background:linear-gradient(135deg,#8B5CF6,#EC4899);border-radius:10px;color:#fff;text-decoration:none;font-weight:700">
            Go to your dashboard →
          </a>
          <p style="margin-top:32px;color:rgba(255,255,255,0.3);font-size:12px">— The Eyebird Team</p>
        </div>
      `,
    }).catch((err) => console.error('[verify-plan] Email failed:', err));

    return NextResponse.json({ success: true, message: 'Creator Plan activated' });
  } catch (err: unknown) {
    console.error('[verify-plan]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
