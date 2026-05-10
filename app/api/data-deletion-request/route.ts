export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, instagram_username, reason } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const submittedAt = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    // Notify privacy team
    await resend.emails.send({
      from: 'Eyebird Privacy <support@eyebird.in>',
      to: 'privacy@eyebird.in',
      subject: `Data Deletion Request — ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#111118;color:#FAFAFA;border-radius:16px;">
          <h2 style="margin:0 0 20px;color:#EF4444;">Data Deletion Request</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Instagram username:</strong> ${instagram_username || '(not provided)'}</p>
          <p><strong>Reason:</strong> ${reason || '(not provided)'}</p>
          <p><strong>Submitted at:</strong> ${submittedAt} IST</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;">
          <p style="color:rgba(255,255,255,0.5);font-size:13px;">Please complete deletion within 7 business days and send the user a confirmation.</p>
        </div>
      `,
    });

    // Confirm to the user
    await resend.emails.send({
      from: 'Eyebird <support@eyebird.in>',
      to: email,
      subject: 'We received your data deletion request',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#111118;color:#FAFAFA;border-radius:16px;">
          <h2 style="margin:0 0 20px;color:#FAFAFA;">Request received</h2>
          <p style="color:rgba(255,255,255,0.7);line-height:1.7;">
            We received your request to delete all personal data associated with <strong>${email}</strong>.
          </p>
          <p style="color:rgba(255,255,255,0.7);line-height:1.7;">
            We will process your request within <strong style="color:#FAFAFA;">7 business days</strong> and send you a final confirmation once deletion is complete.
          </p>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:24px;">
            If you did not submit this request, please ignore this email or contact us at support@eyebird.in.
          </p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0;">
          <p style="color:rgba(255,255,255,0.3);font-size:12px;">Eyebird · support@eyebird.in</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[data-deletion-request] error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
