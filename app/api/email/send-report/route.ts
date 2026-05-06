export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

function scoreColor(s: number) {
  return s >= 75 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444';
}
function hookColor(s: number) {
  return s >= 7 ? '#22C55E' : s >= 5 ? '#F59E0B' : '#EF4444';
}
function hookGrade(s: number) {
  return s >= 9 ? 'Great' : s >= 7 ? 'Strong' : s >= 5 ? 'Average' : 'Weak';
}

export async function POST(request: NextRequest) {
  try {
    const { igUserId, email } = await request.json();
    if (!igUserId || !email) {
      return NextResponse.json({ error: 'igUserId and email required' }, { status: 400 });
    }

    const { data: audit, error: auditError } = await supabaseAdmin
      .from('audits')
      .select('username, overall_score, ai_analysis, computed_metrics, created_at')
      .eq('ig_user_id', igUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const reportUrl = `${appUrl}/audit/${igUserId}?saved=1`;
    const username = audit.username || igUserId;
    const score = audit.overall_score || 0;
    const ai = audit.ai_analysis || {};
    const m = audit.computed_metrics || {};
    const sc = scoreColor(score);

    const actionPlan: any[] = ai.action_plan || [];
    const hookScores: any[] = (ai.hook_scores || []).slice(0, 8);
    const hashtags: string[] = ai.recommended_hashtags || [];
    const rates = ai.estimated_rates || {};
    const followers = (m.followers || 0).toLocaleString('en-IN');

    /* ── helpers ── */
    const card = (content: string) =>
      `<div style="background:#18181F;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.08);">${content}</div>`;

    const sectionLabel = (emoji: string, title: string, color = '#A855F7') =>
      `<div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${color};margin-bottom:8px;">${emoji} ${title}</div>`;

    const divider = `<div style="height:1px;background:rgba(255,255,255,0.06);margin:20px 0;"></div>`;

    /* ── Hook table rows ── */
    const hookRows = hookScores.length > 0
      ? hookScores.map((h: any, i: number) => {
          const c = hookColor(h.score);
          return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);background:${i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'};">
            <td style="padding:10px 12px;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.4;">"${h.hook.length > 55 ? h.hook.slice(0, 52) + '…' : h.hook}"</td>
            <td style="padding:10px 12px;text-align:center;font-size:14px;font-weight:900;color:${c};">${h.score}/10</td>
            <td style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:${c};">${hookGrade(h.score)}</td>
          </tr>`;
        }).join('')
      : '';

    /* ── Rate card rows ── */
    const rateRows = [
      { emoji: '📖', label: 'Instagram Story', key: 'story', hot: false },
      { emoji: '🎬', label: 'Dedicated Reel', key: 'reel', hot: true },
      { emoji: '🎠', label: 'Carousel Post', key: 'carousel', hot: false },
      { emoji: '📅', label: 'Monthly Retainer', key: 'monthly_package', hot: false },
    ].filter(r => rates[r.key]).map((r, i, arr) => {
      const rate = rates[r.key];
      const c = r.hot ? '#A855F7' : 'rgba(255,255,255,0.7)';
      return `<tr style="border-bottom:${i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'};background:${r.hot ? 'rgba(168,85,247,0.07)' : 'transparent'};">
        <td style="padding:13px 16px;color:${c};font-size:14px;font-weight:${r.hot ? '700' : '500'};">${r.emoji} ${r.label}${r.hot ? ' <span style="font-size:10px;padding:2px 7px;border-radius:99px;background:rgba(168,85,247,0.15);color:#A855F7;margin-left:6px;">Most popular</span>' : ''}</td>
        <td style="padding:13px 16px;text-align:right;font-size:14px;font-weight:800;color:${c};">₹${rate.min.toLocaleString('en-IN')} – ₹${rate.max.toLocaleString('en-IN')}</td>
      </tr>`;
    }).join('');

    /* ── Action plan items ── */
    const actionColors = ['#FF3E80', '#A855F7', '#3B82F6'];
    const actionItems = actionPlan.slice(0, 3).map((a: any, i: number) => {
      const c = actionColors[i] || '#A855F7';
      const isHigh = a.impact === 'HIGH';
      return `
      <div style="border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);margin-bottom:12px;background:#18181F;">
        <div style="height:2px;background:linear-gradient(90deg,${c},#7C3AED);"></div>
        <div style="padding:18px 20px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,${c},#7C3AED);display:flex;align-items:center;justify-content:center;font-weight:900;color:white;font-size:14px;flex-shrink:0;">${a.rank}</div>
              <div style="font-size:15px;font-weight:800;color:white;line-height:1.35;margin-top:4px;">${a.problem}</div>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;background:${isHigh ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'};color:${isHigh ? '#EF4444' : '#F59E0B'};border:1px solid ${isHigh ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'};white-space:nowrap;flex-shrink:0;margin-left:12px;">${a.impact}</span>
          </div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:rgba(255,255,255,0.3);margin-bottom:4px;">Root Cause</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:12px;">${a.root_cause}</div>
          <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:12px 14px;margin-bottom:10px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:rgba(255,255,255,0.4);margin-bottom:6px;">Exact Fix</div>
            <div style="font-size:13px;font-weight:600;color:white;line-height:1.65;">${a.exact_fix}</div>
          </div>
          <div style="font-size:13px;font-weight:600;color:#22C55E;line-height:1.6;">↑ ${a.expected_result}</div>
        </div>
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Your Eyebird Full Audit — @${username}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:620px;margin:24px auto;background:#111118;border-radius:20px;overflow:hidden;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED);padding:36px 32px;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.04em;">Eyebird</div>
    <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:3px;letter-spacing:0.03em;">Instagram Intelligence for Indian Creators</div>
  </div>

  <!-- Body -->
  <div style="padding:32px 32px 0;">
    <h1 style="color:#FAFAFA;font-size:22px;font-weight:900;margin:0 0 6px;letter-spacing:-0.03em;">Your full playbook, @${username} 🎯</h1>
    <p style="color:#A1A1B5;font-size:14px;line-height:1.65;margin:0 0 28px;">Analysed across 22 data points. Here's everything we found — ranked by what matters most.</p>

    <!-- Score card -->
    ${card(`
      <div style="text-align:center;">
        <div style="font-size:72px;font-weight:900;color:${sc};line-height:1;letter-spacing:-0.05em;">${score}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:4px;">Account Health Score / 100</div>
        <div style="margin:14px auto 0;max-width:240px;background:rgba(255,255,255,0.06);border-radius:99px;height:6px;overflow:hidden;">
          <div style="width:${score}%;height:100%;background:linear-gradient(90deg,#FF3E80,#A855F7);border-radius:99px;"></div>
        </div>
      </div>
    `)}

    ${divider}

    <!-- Hook Quality -->
    ${hookRows ? `
    <div style="margin-bottom:16px;">
      ${sectionLabel('⚡', 'Hook Quality Analysis', '#F59E0B')}
      <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
        <thead>
          <tr style="background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.07);">
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.06em;text-transform:uppercase;">Hook</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.06em;text-transform:uppercase;">Score</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.06em;text-transform:uppercase;">Grade</th>
          </tr>
        </thead>
        <tbody>${hookRows}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- Weakest hook rewrite -->
    ${ai.weakest_hook_rewrite ? card(`
      ${sectionLabel('🔁', 'Your Weakest Hook — Rewritten by AI', '#A855F7')}
      ${ai.weakest_hook ? `<div style="font-size:13px;color:rgba(255,255,255,0.35);text-decoration:line-through;margin-bottom:10px;font-style:italic;">"${ai.weakest_hook}"</div>` : ''}
      <div style="font-size:14px;font-weight:700;color:white;line-height:1.6;">"${ai.weakest_hook_rewrite}"</div>
    `) : ''}

    ${divider}

    <!-- Hashtags -->
    ${hashtags.length > 0 ? card(`
      ${sectionLabel('#️⃣', 'Goldzone Hashtags', '#3B82F6')}
      <div style="margin-top:4px;">
        ${hashtags.map(t => `<span style="display:inline-block;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22C55E;border-radius:99px;padding:4px 10px;font-size:12px;font-weight:600;margin:3px;font-family:monospace;">${t}</span>`).join('')}
      </div>
      ${ai.hashtag_verdict ? `<p style="font-size:12px;color:rgba(255,255,255,0.4);font-style:italic;margin-top:12px;line-height:1.6;">${ai.hashtag_verdict}</p>` : ''}
    `) : ''}

    ${divider}

    <!-- Rate Card -->
    ${rateRows ? card(`
      ${sectionLabel('💰', `Your Brand Rate Card — Based on ${m.engagementRate || 0}% ER & ${followers} followers`, '#22C55E')}
      <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);margin-top:10px;">
        <tbody>${rateRows}</tbody>
      </table>
      <div style="margin-top:12px;padding:10px 14px;border-radius:10px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);">
        <span style="font-size:13px;color:#22C55E;line-height:1.6;">💡 Most creators in your niche charge 40% less than what brands are willing to pay. Don't undersell yourself.</span>
      </div>
    `) : ''}

    ${divider}

    <!-- Bio Rewrite -->
    ${ai.bio_rewrite ? card(`
      ${sectionLabel('✏️', 'AI-Rewritten Bio', '#A855F7')}
      <div style="font-size:12px;color:rgba(255,255,255,0.35);text-decoration:line-through;margin-bottom:10px;font-style:italic;line-height:1.6;">${m.bio || 'Original bio'}</div>
      <div style="font-size:14px;font-weight:600;color:white;line-height:1.7;white-space:pre-wrap;">${ai.bio_rewrite}</div>
      ${ai.bio_rewrite_reason ? `<p style="font-size:12px;color:rgba(255,255,255,0.4);font-style:italic;margin-top:10px;line-height:1.6;">Why: ${ai.bio_rewrite_reason}</p>` : ''}
    `) : ''}

    ${divider}

    <!-- Best time to post -->
    ${ai.best_posting_time ? `
    <div style="margin-bottom:16px;">
      ${sectionLabel('⏰', 'Best Time to Post', '#A855F7')}
      <div style="background:rgba(168,85,247,0.07);border:1px solid rgba(168,85,247,0.2);border-left:3px solid #A855F7;border-radius:12px;padding:16px 18px;">
        <div style="font-size:16px;font-weight:800;color:white;margin-bottom:6px;">${ai.best_posting_time}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.65;">${ai.best_posting_time_reason || ''}</div>
      </div>
    </div>
    ` : ''}

    ${divider}

    <!-- Action Plan -->
    ${actionItems ? `
    <div style="margin-bottom:16px;">
      ${sectionLabel('🎯', '3 Moves That Will Change Your Numbers', '#FF3E80')}
      <h2 style="font-size:20px;font-weight:900;color:white;margin:6px 0 14px;letter-spacing:-0.03em;">Your personalised growth roadmap</h2>
      ${actionItems}
    </div>
    ` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin:32px 0 0;">
      <a href="${reportUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:-0.01em;">
        Open Interactive Report →
      </a>
      <p style="color:#6B6B80;font-size:12px;margin-top:10px;">Your report is permanently saved at the link above.</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:20px 32px;margin-top:28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
    <p style="color:#444455;font-size:12px;margin:0;line-height:1.6;">
      © ${new Date().getFullYear()} Eyebird · Made in India 🇮🇳 for Indian Creators<br>
      Questions? <a href="mailto:support@eyebird.in" style="color:#A855F7;text-decoration:none;">support@eyebird.in</a>
    </p>
  </div>
</div>
</body>
</html>`;

    await resend.emails.send({
      from: 'Eyebird <support@eyebird.in>',
      to: email,
      subject: `Your full Eyebird audit report — @${username} 🎯`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[email/send-report] Error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
