export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { igUserId } = await request.json();

    if (!igUserId) {
      return NextResponse.json({ error: 'igUserId required' }, { status: 400 });
    }

    // Get account + access token
    const { data: account, error: accountError } = await supabaseAdmin
      .from('instagram_accounts')
      .select('access_token, username, followers_count, biography, profile_picture_url, media_count')
      .eq('ig_user_id', igUserId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found. Please reconnect Instagram.' }, { status: 404 });
    }

    const token = account.access_token;

    // Fetch last 20 posts with engagement data
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media?fields=id,media_type,timestamp,like_count,comments_count,caption,thumbnail_url,media_url&limit=20&access_token=${token}`
    );
    const mediaData = await mediaResponse.json();

    if (mediaData.error) {
      console.error('[fetch-data] Media fetch error:', mediaData.error);
      return NextResponse.json({ error: 'Could not fetch Instagram posts. Token may have expired.' }, { status: 401 });
    }

    const posts = mediaData.data || [];

    if (posts.length < 3) {
      return NextResponse.json({ error: 'Account needs at least 3 posts for an audit.' }, { status: 400 });
    }

    // Fetch per-post insights (reach, impressions, saved) in parallel
    const mediaWithInsights = await Promise.all(
      posts.map(async (post: any) => {
        try {
          const metricList =
            post.media_type === 'VIDEO' || post.media_type === 'REELS'
              ? 'reach,impressions,saved,video_views,total_interactions'
              : 'reach,impressions,saved,total_interactions';

          const insightResponse = await fetch(
            `https://graph.facebook.com/v19.0/${post.id}/insights?metric=${metricList}&access_token=${token}`
          );
          const insightData = await insightResponse.json();
          const insights: Record<string, number> = {};
          if (insightData.data) {
            insightData.data.forEach((metric: any) => {
              insights[metric.name] = metric.values?.[0]?.value || 0;
            });
          }
          return { ...post, ...insights };
        } catch {
          return post;
        }
      })
    );

    // Fetch account-level insights (last 90 days reach/impressions)
    const since = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
    const until = Math.floor(Date.now() / 1000);
    let insightsData = null;
    try {
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=reach,impressions,profile_views&period=day&since=${since}&until=${until}&access_token=${token}`
      );
      insightsData = await insightsResponse.json();
    } catch {
      insightsData = null;
    }

    // Fetch audience demographics
    let audienceData = null;
    try {
      const audienceResponse = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=audience_gender_age,audience_city,online_followers&period=lifetime&access_token=${token}`
      );
      audienceData = await audienceResponse.json();
    } catch {
      audienceData = null;
    }

    // Upsert raw data cache
    const { error: upsertError } = await supabaseAdmin
      .from('ig_raw_data')
      .upsert(
        {
          ig_user_id: igUserId,
          profile_data: {
            username: account.username,
            followers_count: account.followers_count,
            biography: account.biography,
            profile_picture_url: account.profile_picture_url,
            media_count: account.media_count,
          },
          media_data: mediaWithInsights,
          insights_data: insightsData,
          audience_data: audienceData,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: 'ig_user_id' }
      );

    if (upsertError) {
      console.error('[fetch-data] DB upsert error:', upsertError);
    }

    return NextResponse.json({
      success: true,
      postCount: mediaWithInsights.length,
      username: account.username,
    });
  } catch (err) {
    console.error('[fetch-data] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
