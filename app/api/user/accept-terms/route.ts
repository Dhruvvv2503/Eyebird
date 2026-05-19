export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
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

    const { marketing_emails, product_updates } = await req.json();
    const userId = session.user.id;
    const userEmail = session.user.email ?? '';
    const now = new Date().toISOString();

    await supabaseAdmin
      .from('user_profiles')
      .update({
        terms_accepted: true,
        terms_accepted_at: now,
        marketing_emails: !!marketing_emails,
        product_updates: !!product_updates,
        onboarding_popup_shown: true,
      })
      .eq('id', userId);

    // Send welcome email
    const userName = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? userEmail.split('@')[0];
    await resend.emails.send({
      from: 'Creatiq <hello@creatiq.in>',
      to: userEmail,
      subject: 'Welcome to Creatiq 🎉',
      html: `
        <div style="font-family: Inter, sans-serif; background: #07060F; color: #fff; padding: 40px; max-width: 560px; margin: 0 auto; border-radius: 16px;">
          <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px;">Welcome, ${userName}!</h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 16px; margin: 0 0 24px;">Your Creatiq account is ready. Here's what you can do right now:</p>
          <ul style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 28px;">
            <li>Connect your Instagram account</li>
            <li>Run a free AI-powered profile audit</li>
            <li>Set up DM automations in minutes</li>
          </ul>
          <a href="https://creatiq.in/dashboard" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: #fff; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none;">Go to Dashboard →</a>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 32px;">You're receiving this because you created a Creatiq account. <a href="https://creatiq.in/terms" style="color: rgba(255,255,255,0.4);">Terms</a> · <a href="https://creatiq.in/privacy" style="color: rgba(255,255,255,0.4);">Privacy</a></p>
        </div>
      `,
    }).catch(() => {});

    // Add to Resend audience/contacts if marketing opted in
    if (marketing_emails && process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email: userEmail,
        firstName: userName.split(' ')[0],
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[accept-terms] error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
