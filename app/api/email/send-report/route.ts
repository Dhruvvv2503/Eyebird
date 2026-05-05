export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { igUserId, email } = await request.json();

    if (!igUserId || !email) {
      return NextResponse.json({ error: 'igUserId and email required' }, { status: 400 });
    }

    // Load audit data
    const { data: audit, error: auditError } = await supabaseAdmin
      .from('audits')
      .select('username, overall_score, ai_analysis, created_at')
      .eq('ig_user_id', igUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (auditError || !audit) {
      console.error('[email/send-report] Audit not found for:', igUserId);
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const reportUrl = `${appUrl}/audit/${igUserId}`;
    const username = audit.username || igUserId;
    const score = audit.overall_score || 0;
    const topAction =
      audit.ai_analysis?.action_plan?.[0]?.exact_fix ||
      'Review your full report for your personalised action plan.';
    const bioRewrite = audit.ai_analysis?.bio_rewrite || '';
    const topHashtags: string[] = audit.ai_analysis?.recommended_hashtags || [];

    const scoreColor =
      score >= 75 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';

    await resend.emails.send({
      from: 'Eyebird <support@eyebird.in>',
      to: email,
      subject: `Your Eyebird audit is ready, @${username} 🎯`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Eyebird Audit Report</title>
</head>
<body style="margin:0;padding:0;background:#0a0a10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#111118;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED);padding:40px 32px;text-align:center;">
      <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:-0.04em;line-height:1;">
        Eyebird
      </div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;letter-spacing:0.02em;">
        Instagram Intelligence for Indian Creators
      </div>
    </div>

    <!-- Greeting -->
    <div style="padding:36px 32px 0;">
      <h1 style="color:#FAFAFA;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.03em;">
        Your audit is ready, @${username} 👋
      </h1>
      <p style="color:#A1A1B5;font-size:15px;line-height:1.65;margin:0 0 28px;">
        We've analysed your account across 22 data points. Here's your personalised intelligence report.
      </p>

      <!-- Score -->
      <div style="background:#18181F;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:64px;font-weight:900;color:${scoreColor};line-height:1;letter-spacing:-0.05em;">${score}</div>
        <div style="color:#6B6B80;font-size:14px;margin-top:6px;">Account Health Score / 100</div>
        <div style="margin-top:16px;background:rgba(255,255,255,0.04);border-radius:8px;height:8px;overflow:hidden;">
          <div style="width:${score}%;height:100%;background:linear-gradient(90deg,#FF3E80,#A855F7);border-radius:8px;"></div>
        </div>
      </div>

      <!-- Top Action -->
      <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-left:4px solid #A855F7;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <div style="color:#A855F7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          🎯 Your #1 Action This Week
        </div>
        <div style="color:#FAFAFA;font-size:15px;line-height:1.6;">${topAction}</div>
      </div>

      ${bioRewrite ? `
      <!-- Bio Rewrite -->
      <div style="background:#18181F;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <div style="color:#6B6B80;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          ✍️ AI-Suggested Bio Rewrite
        </div>
        <div style="color:#FAFAFA;font-size:15px;line-height:1.6;font-style:italic;">"${bioRewrite}"</div>
      </div>
      ` : ''}

      ${topHashtags.length > 0 ? `
      <!-- Hashtags -->
      <div style="background:#18181F;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <div style="color:#6B6B80;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">
          # Recommended Hashtags
        </div>
        <div>
          ${topHashtags.map((tag) => `<span style="display:inline-block;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.25);color:#A855F7;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:600;margin:3px;">${tag}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${reportUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:700;font-size:16px;letter-spacing:-0.01em;">
          View Your Full Report →
        </a>
        <p style="color:#6B6B80;font-size:12px;margin-top:12px;">
          This report is yours permanently. Bookmark the link above.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="color:#444455;font-size:12px;margin:0;line-height:1.6;">
        © ${new Date().getFullYear()} Eyebird · Made in India 🇮🇳 for Indian Creators<br>
        Questions? Reply to this email or contact
        <a href="mailto:support@eyebird.in" style="color:#A855F7;text-decoration:none;">support@eyebird.in</a>
      </p>
    </div>

  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[email/send-report] Error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
