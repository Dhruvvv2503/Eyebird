export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Metric computation ────────────────────────────────────────────────────────
function computeMetrics(rawData: any) {
  const { profile_data, media_data } = rawData;
  const posts: any[] = media_data || [];

  if (posts.length < 3) return null;

  const followers = profile_data?.followers_count || 1;

  // Engagement rate (likes + comments / followers)
  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.like_count || 0) + (p.comments_count || 0),
    0
  );
  const avgEngagement = totalEngagement / posts.length;
  const engagementRate = parseFloat(((avgEngagement / followers) * 100).toFixed(2));

  // ER benchmark by follower band
  const benchmark =
    followers < 10000 ? '5–8%' :
    followers < 50000 ? '3–5%' :
    followers < 100000 ? '2–4%' : '1–2%';

  // Format breakdown
  const formatBreakdown: Record<string, any> = {};
  posts.forEach((p) => {
    const type = p.media_type || 'IMAGE';
    if (!formatBreakdown[type]) {
      formatBreakdown[type] = { count: 0, totalLikes: 0, totalComments: 0, totalReach: 0 };
    }
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

  // Top 5 posts by engagement
  const top5Posts = [...posts]
    .sort((a, b) => {
      const ea = (a.like_count || 0) + (a.comments_count || 0);
      const eb = (b.like_count || 0) + (b.comments_count || 0);
      return eb - ea;
    })
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      type: p.media_type,
      timestamp: p.timestamp,
      likes: p.like_count || 0,
      comments: p.comments_count || 0,
      reach: p.reach || 0,
      saved: p.saved || 0,
      hook: p.caption ? p.caption.split('\n')[0].substring(0, 150) : '(no caption)',
      engagementRate: parseFloat(
        (((p.like_count || 0) + (p.comments_count || 0)) / followers * 100).toFixed(2)
      ),
    }));

  // Posting frequency (posts in last 90 days → per week)
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentPosts = posts.filter((p) => new Date(p.timestamp) > cutoff);
  const postsPerWeek = parseFloat((recentPosts.length / 13).toFixed(1));

  // Best posting hour (hour of day from top 5 posts)
  const hours = top5Posts.map((p) => new Date(p.timestamp).getHours());
  const bestHour = hours.length
    ? hours.reduce((a, b) => (hours.filter((v) => v === a).length >= hours.filter((v) => v === b).length ? a : b))
    : 21;

  // Hashtag analysis
  const allTags: string[] = [];
  posts.forEach((p) => {
    const matches = (p.caption || '').match(/#[\w\u0900-\u097F]+/g) || [];
    allTags.push(...matches);
  });
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  const topHashtags = Object.entries(tagFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Reel/video hooks
  const reelHooks = posts
    .filter((p) => p.media_type === 'VIDEO' || p.media_type === 'REELS')
    .slice(0, 10)
    .map((p) => (p.caption ? p.caption.split('\n')[0].substring(0, 180) : '(no caption)'));

  return {
    engagementRate,
    benchmark,
    avgLikes: Math.round(posts.reduce((s, p) => s + (p.like_count || 0), 0) / posts.length),
    avgComments: Math.round(posts.reduce((s, p) => s + (p.comments_count || 0), 0) / posts.length),
    formatBreakdown,
    top5Posts,
    postsPerWeek,
    bestPostingHour: bestHour,
    topHashtags,
    reelHooks,
    totalPostsAnalyzed: posts.length,
    followers,
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
    if (!igUserId) {
      return NextResponse.json({ error: 'igUserId required' }, { status: 400 });
    }

    // Load raw data
    const { data: rawData, error: rawError } = await supabaseAdmin
      .from('ig_raw_data')
      .select('*')
      .eq('ig_user_id', igUserId)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (rawError || !rawData) {
      return NextResponse.json(
        { error: 'No Instagram data found. Please fetch data first.' },
        { status: 404 }
      );
    }

    const metrics = computeMetrics(rawData);
    if (!metrics) {
      return NextResponse.json(
        { error: 'Not enough posts to generate an audit (minimum 3 required).' },
        { status: 400 }
      );
    }

    // Build Claude prompt
    const prompt = `You are an expert Instagram growth analyst for Indian creators. Analyse this account's data and provide a precise, data-driven audit. Reference exact numbers. Never give generic advice — every insight must be specific to THIS account.

ACCOUNT:
- Username: @${metrics.username}
- Followers: ${metrics.followers.toLocaleString()}
- Bio: "${metrics.bio}"
- Posts analysed: ${metrics.totalPostsAnalyzed}
- Avg engagement rate: ${metrics.engagementRate}% (benchmark for this band: ${metrics.benchmark})
- Avg likes: ${metrics.avgLikes} | Avg comments: ${metrics.avgComments}
- Posts/week (last 90 days): ${metrics.postsPerWeek}
- Best posting hour (from top posts): ${metrics.bestPostingHour}:00 IST

CONTENT FORMAT PERFORMANCE:
${JSON.stringify(metrics.formatBreakdown, null, 2)}

TOP 5 POSTS (by engagement):
${JSON.stringify(metrics.top5Posts, null, 2)}

TOP 10 HASHTAGS USED:
${JSON.stringify(metrics.topHashtags, null, 2)}

LAST 10 VIDEO/REEL HOOKS (first caption line):
${metrics.reelHooks.length > 0 ? metrics.reelHooks.map((h, i) => `${i + 1}. "${h}"`).join('\n') : 'No reels/videos found.'}

Respond ONLY with valid JSON (no markdown fences, no explanation):
{
  "overall_score": <0-100>,
  "profile_completeness_score": <0-100>,
  "bio_verdict": "<one specific sentence about their bio>",
  "bio_rewrite": "<complete rewritten bio ≤150 chars, niche-specific>",
  "bio_rewrite_reason": "<one sentence why>",
  "engagement_verdict": "<one sentence referencing exact ER vs benchmark>",
  "best_format": "<best performing content type for THIS account>",
  "best_format_reason": "<data-backed one sentence>",
  "posting_frequency_score": <0-100>,
  "posting_frequency_verdict": "<one sentence with specific recommendation>",
  "best_posting_time": "<e.g. Thursday 9 PM IST>",
  "best_posting_time_reason": "<one sentence why based on data>",
  "hook_scores": [{"hook": "<text>", "score": <1-10>, "verdict": "<one sentence>"}],
  "hook_avg_score": <1-10>,
  "weakest_hook": "<worst hook text>",
  "weakest_hook_rewrite": "<improved version>",
  "hashtag_score": <0-100>,
  "hashtag_verdict": "<one sentence about strategy>",
  "recommended_hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "recommended_hashtags_reason": "<one sentence>",
  "brand_readiness_score": <0-100>,
  "brand_readiness_verdict": "<one sentence>",
  "estimated_rates": {
    "story": {"min": <INR>, "max": <INR>},
    "reel": {"min": <INR>, "max": <INR>},
    "carousel": {"min": <INR>, "max": <INR>},
    "monthly_package": {"min": <INR>, "max": <INR>}
  },
  "action_plan": [
    {
      "rank": 1,
      "impact": "HIGH",
      "problem": "<specific problem with exact numbers>",
      "root_cause": "<specific root cause>",
      "exact_fix": "<specific actionable fix for this week>",
      "expected_result": "<measurable expected outcome>"
    },
    {
      "rank": 2,
      "impact": "HIGH",
      "problem": "<specific problem>",
      "root_cause": "<specific root cause>",
      "exact_fix": "<specific fix>",
      "expected_result": "<expected outcome>"
    },
    {
      "rank": 3,
      "impact": "MEDIUM",
      "problem": "<specific problem>",
      "root_cause": "<specific root cause>",
      "exact_fix": "<specific fix>",
      "expected_result": "<expected outcome>"
    }
  ]
}`;

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    let aiAnalysis: any;
    try {
      const cleaned = responseText
        .replace(/^```json\s*/m, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();
      aiAnalysis = JSON.parse(cleaned);
    } catch {
      console.error('[audit/generate] Claude response parse failed:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'AI analysis failed to parse. Please try again.' },
        { status: 500 }
      );
    }

    // Ensure action_plan has exactly 3 items minimum
    if (!aiAnalysis.action_plan || aiAnalysis.action_plan.length < 1) {
      return NextResponse.json(
        { error: 'AI returned incomplete data. Please try again.' },
        { status: 500 }
      );
    }

    // Store as NEW audit row (insert, not upsert — allows multiple audits per user for history)
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

    return NextResponse.json({
      success: true,
      auditId: audit?.id,
      overallScore: aiAnalysis.overall_score,
    });
  } catch (err) {
    console.error('[audit/generate] Unexpected error:', err);
    return NextResponse.json({ error: 'Audit generation failed.' }, { status: 500 });
  }
}
