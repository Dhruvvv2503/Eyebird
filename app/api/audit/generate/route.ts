export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Metric computation ─────────────────────────────────────────────────────────
function computeMetrics(rawData: any) {
  const { profile_data, media_data } = rawData;
  const posts: any[] = media_data || [];
  if (posts.length < 3) return null;

  const followers = profile_data?.followers_count || 1;
  const totalEng = posts.reduce((s, p) => s + (p.like_count || 0) + (p.comments_count || 0), 0);
  const avgEngagement = totalEng / posts.length;
  const engagementRate = parseFloat(((avgEngagement / followers) * 100).toFixed(2));
  const benchmark = followers < 10000 ? '5–8%' : followers < 50000 ? '3–5%' : followers < 100000 ? '2–4%' : '1–2%';

  // Format breakdown
  const formatBreakdown: Record<string, any> = {};
  posts.forEach((p) => {
    const type = p.media_type || 'IMAGE';
    if (!formatBreakdown[type]) formatBreakdown[type] = { count: 0, totalLikes: 0, totalComments: 0, totalReach: 0 };
    formatBreakdown[type].count++;
    formatBreakdown[type].totalLikes += p.like_count || 0;
    formatBreakdown[type].totalComments += p.comments_count || 0;
    formatBreakdown[type].totalReach += p.reach || 0;
  });
  Object.keys(formatBreakdown).forEach((type) => {
    const fb = formatBreakdown[type];
    const eng = fb.totalLikes + fb.totalComments;
    fb.avgEngagement = Math.round(eng / fb.count);
    fb.avgReach = Math.round(fb.totalReach / fb.count);
    fb.avgEngagementRate = parseFloat(((eng / fb.count / followers) * 100).toFixed(2));
  });

  // All posts sorted by date (for content timeline)
  const allPostsTimeline = [...posts]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((p) => ({
      date: p.timestamp,
      type: p.media_type || 'IMAGE',
      likes: p.like_count || 0,
      comments: p.comments_count || 0,
      reach: p.reach || 0,
      engagementRate: parseFloat((((p.like_count || 0) + (p.comments_count || 0)) / followers * 100).toFixed(2)),
      hook: p.caption ? p.caption.split('\n')[0].substring(0, 80) : '',
    }));

  // Top 5 posts by engagement
  const top5Posts = [...posts]
    .sort((a, b) => ((b.like_count || 0) + (b.comments_count || 0)) - ((a.like_count || 0) + (a.comments_count || 0)))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      type: p.media_type,
      timestamp: p.timestamp,
      likes: p.like_count || 0,
      comments: p.comments_count || 0,
      reach: p.reach || 0,
      saved: p.saved || 0,
      hook: p.caption ? p.caption.split('\n')[0].substring(0, 200) : '(no caption)',
      caption: p.caption ? p.caption.substring(0, 400) : '',
      engagementRate: parseFloat((((p.like_count || 0) + (p.comments_count || 0)) / followers * 100).toFixed(2)),
    }));

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentPosts = posts.filter((p) => new Date(p.timestamp) > cutoff);
  const postsPerWeek = parseFloat((recentPosts.length / 13).toFixed(1));

  const hours = top5Posts.map((p) => new Date(p.timestamp).getHours());
  const bestHour = hours.length
    ? hours.reduce((a, b) => hours.filter((v) => v === a).length >= hours.filter((v) => v === b).length ? a : b)
    : 21;

  const allTags: string[] = [];
  posts.forEach((p) => { const m = (p.caption || '').match(/#[\w\u0900-\u097F]+/g) || []; allTags.push(...m); });
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  const topHashtags = Object.entries(tagFreq).sort(([, a], [, b]) => b - a).slice(0, 10).map(([tag, count]) => ({ tag, count }));

  const reelHooks = posts
    .filter((p) => p.media_type === 'VIDEO' || p.media_type === 'REELS')
    .slice(0, 10)
    .map((p) => (p.caption ? p.caption.split('\n')[0].substring(0, 180) : '(no caption)'));

  return {
    engagementRate, benchmark,
    avgLikes: Math.round(posts.reduce((s, p) => s + (p.like_count || 0), 0) / posts.length),
    avgComments: Math.round(posts.reduce((s, p) => s + (p.comments_count || 0), 0) / posts.length),
    formatBreakdown, top5Posts, allPostsTimeline,
    postsPerWeek, bestPostingHour: bestHour,
    topHashtags, reelHooks,
    totalPostsAnalyzed: posts.length, followers,
    bio: profile_data?.biography || '',
    username: profile_data?.username || '',
    profilePictureUrl: profile_data?.profile_picture_url || null,
    mediaCount: profile_data?.media_count || posts.length,
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { igUserId } = await request.json();
    if (!igUserId) return NextResponse.json({ error: 'igUserId required' }, { status: 400 });

    const { data: rawData, error: rawError } = await supabaseAdmin
      .from('ig_raw_data').select('*').eq('ig_user_id', igUserId)
      .order('fetched_at', { ascending: false }).limit(1).single();

    if (rawError || !rawData) return NextResponse.json({ error: 'No Instagram data found. Please fetch data first.' }, { status: 404 });

    const metrics = computeMetrics(rawData);
    if (!metrics) return NextResponse.json({ error: 'Not enough posts to generate an audit (minimum 3 required).' }, { status: 400 });

    // ── Expert-grade Claude prompt ─────────────────────────────────────────────
    const prompt = `You are the world's foremost Instagram growth strategist for Indian creators — 25 years of experience, data-obsessed, brutally specific. You have diagnosed 50,000+ accounts. You never give generic advice. Every word you write must be rooted in THIS account's specific numbers.

Your job: produce a devastatingly accurate, insight-dense audit that makes the creator feel seen, understood, and equipped with an exact playbook. A creator should read this and think "how does it know all this?"

═══════════════════════════════════════════════
ACCOUNT DATA
═══════════════════════════════════════════════
Handle: @${metrics.username}
Followers: ${metrics.followers.toLocaleString('en-IN')}
Bio: "${metrics.bio}"
Posts analysed: ${metrics.totalPostsAnalyzed}
Total media count: ${metrics.mediaCount}
Engagement Rate: ${metrics.engagementRate}% (Industry benchmark for this tier: ${metrics.benchmark})
Avg Likes: ${metrics.avgLikes} | Avg Comments: ${metrics.avgComments}
Posts/week (last 90 days): ${metrics.postsPerWeek}
Best posting hour (derived from top posts): ${metrics.bestPostingHour}:00 IST

CONTENT FORMAT PERFORMANCE:
${JSON.stringify(metrics.formatBreakdown, null, 2)}

TOP 5 POSTS (ranked by engagement — study these deeply):
${JSON.stringify(metrics.top5Posts, null, 2)}

TOP 10 HASHTAGS USED:
${JSON.stringify(metrics.topHashtags, null, 2)}

LAST 10 VIDEO/REEL HOOKS:
${metrics.reelHooks.length > 0 ? metrics.reelHooks.map((h, i) => `${i + 1}. "${h}"`).join('\n') : 'No reels found.'}

═══════════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════════
Think step by step before answering. First identify the creator's niche from their bio and captions. Then derive every insight from the numbers above. Reference exact figures. Never say "consider posting more" — say "post Reels on Tuesday and Thursday at 8 PM IST based on your top posts' timing."

For viral_reverse_engineering: analyse WHY each top post outperformed. Look for patterns in hook style, caption length, format, time, hashtag count, engagement velocity. Give a crisp "viral formula" they can replicate.

For growth_projection: base numbers on current trajectory + what realistically changes if they follow your action plan. Be optimistic but grounded. Provide numbers for 30/60/90 days per scenario. Break down by content type with specific weekly targets.

Respond ONLY with valid JSON (no markdown, no explanation outside JSON):

{
  "overall_score": <0-100 integer>,
  "profile_completeness_score": <0-100>,
  "niche_label": "<2-4 word niche e.g. 'Fitness & Wellness', 'Food & Recipes', 'Finance & Investing'>",
  "niche_score": <0-100, how focused/consistent their content is>,
  "niche_verdict": "<one sentence on niche clarity>",
  "bio_verdict": "<one specific sentence referencing their actual bio>",
  "bio_rewrite": "<complete rewritten bio ≤150 chars, niche-specific, with CTA>",
  "bio_rewrite_reason": "<one sentence why the rewrite is better>",
  "engagement_verdict": "<one sentence with exact ER vs benchmark, verdict>",
  "best_format": "<best performing content type for THIS account>",
  "best_format_reason": "<one data-backed sentence with exact numbers>",
  "posting_frequency_score": <0-100>,
  "posting_frequency_verdict": "<specific recommendation with exact numbers e.g. 'Post 4x/week — you're at 1.8x now'>",
  "best_posting_time": "<specific day + time e.g. 'Tuesday & Thursday, 8–9 PM IST'>",
  "best_posting_time_reason": "<one sentence citing their actual top post times>",
  "hook_scores": [{"hook": "<first 60 chars>", "score": <1-10>, "verdict": "<one sentence why>"}],
  "hook_avg_score": <1-10>,
  "weakest_hook": "<exact text of worst hook>",
  "weakest_hook_rewrite": "<dramatically improved version, same topic>",
  "hashtag_score": <0-100>,
  "hashtag_verdict": "<one sentence on their hashtag strategy quality>",
  "recommended_hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
  "recommended_hashtags_reason": "<one sentence on why these specific tags>",
  "brand_readiness_score": <0-100>,
  "brand_readiness_verdict": "<one sentence on sponsorship readiness>",
  "estimated_rates": {
    "story": {"min": <INR>, "max": <INR>},
    "reel": {"min": <INR>, "max": <INR>},
    "carousel": {"min": <INR>, "max": <INR>},
    "monthly_package": {"min": <INR>, "max": <INR>}
  },
  "viral_reverse_engineering": {
    "viral_formula": "<2-3 sentence pattern extracted from their top posts — specific, replicable>",
    "posts": [
      {
        "hook": "<hook text, max 80 chars>",
        "format": "<IMAGE|REELS|VIDEO|CAROUSEL_ALBUM>",
        "likes": <number>,
        "comments": <number>,
        "engagement_rate": <number>,
        "why_it_worked": ["<reason 1, specific>", "<reason 2, specific>", "<reason 3, specific>"],
        "replication_template": "<exact template they can use: 'Post a [format] about [topic] using hook: [hook structure]. Add [CTA]. Best time: [time].'>",
        "score": <1-10 viral potential score>
      }
    ]
  },
  "growth_projection": {
    "baseline_monthly_growth": <estimated current followers gained per month without changes>,
    "conservative": {
      "label": "<short label e.g. '2x/week + hashtag fix'>",
      "actions": ["<action 1>", "<action 2>"],
      "day30": <followers gained>,
      "day60": <followers gained cumulative>,
      "day90": <followers gained cumulative>,
      "er_improvement": "<e.g. +0.8%>"
    },
    "moderate": {
      "label": "<short label e.g. '3x/week + bio + best time'>",
      "actions": ["<action 1>", "<action 2>", "<action 3>"],
      "day30": <followers gained>,
      "day60": <followers gained cumulative>,
      "day90": <followers gained cumulative>,
      "er_improvement": "<e.g. +1.5%>"
    },
    "aggressive": {
      "label": "<short label e.g. '5x/week + all fixes + collabs'>",
      "actions": ["<action 1>", "<action 2>", "<action 3>", "<action 4>"],
      "day30": <followers gained>,
      "day60": <followers gained cumulative>,
      "day90": <followers gained cumulative>,
      "er_improvement": "<e.g. +2.8%>"
    },
    "by_content_type": {
      "reels": {"weekly_target": <number>, "expected_reach_multiplier": <number e.g. 3.2>, "reason": "<one sentence>"},
      "carousels": {"weekly_target": <number>, "expected_reach_multiplier": <number>, "reason": "<one sentence>"},
      "static": {"weekly_target": <number>, "expected_reach_multiplier": <number>, "reason": "<one sentence>"}
    }
  },
  "action_plan": [
    {
      "rank": 1,
      "impact": "HIGH",
      "problem": "<specific problem with exact numbers from their data>",
      "root_cause": "<precise root cause, not generic>",
      "exact_fix": "<step-by-step this week fix, actionable today>",
      "expected_result": "<measurable outcome with timeline>"
    },
    {
      "rank": 2,
      "impact": "HIGH",
      "problem": "<specific problem>",
      "root_cause": "<precise root cause>",
      "exact_fix": "<step-by-step fix>",
      "expected_result": "<measurable outcome>"
    },
    {
      "rank": 3,
      "impact": "MEDIUM",
      "problem": "<specific problem>",
      "root_cause": "<precise root cause>",
      "exact_fix": "<step-by-step fix>",
      "expected_result": "<measurable outcome>"
    }
  ],
  "heatmap_data": [[<24 floats 0-1 for Sunday hours 0-23>],[<Monday>],[<Tuesday>],[<Wednesday>],[<Thursday>],[<Friday>],[<Saturday>]],
  "best_posting_times": [{"day": "<Mon/Tue/...>", "hour": <0-23>, "label": "<e.g. '8 PM'>"}]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let aiAnalysis: any;
    try {
      const cleaned = responseText.replace(/^```json\s*/m, '').replace(/^```\s*/m, '').replace(/```\s*$/m, '').trim();
      aiAnalysis = JSON.parse(cleaned);
    } catch {
      console.error('[audit/generate] Claude parse failed:', responseText.substring(0, 500));
      return NextResponse.json({ error: 'AI analysis failed to parse. Please try again.' }, { status: 500 });
    }

    if (!aiAnalysis.action_plan || aiAnalysis.action_plan.length < 1) {
      return NextResponse.json({ error: 'AI returned incomplete data. Please try again.' }, { status: 500 });
    }

    // Store as NEW audit row
    const { data: audit, error: auditError } = await supabaseAdmin
      .from('audits')
      .insert({
        ig_user_id: igUserId,
        username: metrics.username,
        computed_metrics: metrics,
        ai_analysis: aiAnalysis,
        overall_score: aiAnalysis.overall_score || 0,
        is_paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (auditError) {
      console.error('[audit/generate] DB error:', auditError);
      return NextResponse.json({ error: 'Failed to save audit.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, auditId: audit?.id, overallScore: aiAnalysis.overall_score });
  } catch (err) {
    console.error('[audit/generate] Unexpected error:', err);
    return NextResponse.json({ error: 'Audit generation failed.' }, { status: 500 });
  }
}
