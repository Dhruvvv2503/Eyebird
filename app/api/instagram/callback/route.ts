export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');
  // Derive origin from the incoming request so redirects always go to the
  // correct host — NEXT_PUBLIC_APP_URL is localhost in dev and must not be
  // used here as it would send production users to localhost.
  const origin = new URL(request.url).origin;

  if (error || !code) {
    console.error('[instagram/callback] OAuth error:', error);
    return NextResponse.redirect(`${origin}/audit?error=oauth_failed`);
  }

  // Decode intent from state
  let intent = 'get_started';
  try {
    if (stateParam) {
      const decoded = JSON.parse(Buffer.from(decodeURIComponent(stateParam), 'base64').toString('utf-8'));
      intent = decoded.intent || 'get_started';
    }
  } catch { /* fallback to get_started */ }

  try {
    const appId = process.env.INSTAGRAM_APP_ID!;
    const appSecret = process.env.INSTAGRAM_APP_SECRET!;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;

    // Step 1: Exchange code for short-lived token
    const tokenFormData = new FormData();
    tokenFormData.append('client_id', appId);
    tokenFormData.append('client_secret', appSecret);
    tokenFormData.append('grant_type', 'authorization_code');
    tokenFormData.append('redirect_uri', redirectUri);
    tokenFormData.append('code', code);

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: tokenFormData,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('[instagram/callback] Token exchange failed:', tokenData);
      return NextResponse.redirect(`${origin}/audit?error=oauth_failed`);
    }

    const shortLivedToken = tokenData.access_token;
    const igUserIdFromToken = tokenData.user_id;

    // Step 2: Exchange for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
    );
    const longLivedData = await longLivedResponse.json();

    const igAccessToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Step 3: Fetch profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,followers_count,media_count,biography&access_token=${igAccessToken}`
    );
    const profileData = await profileResponse.json();

    if (profileData.error) {
      console.error('[instagram/callback] Profile fetch failed:', profileData.error);
      return NextResponse.redirect(`${origin}/audit?error=oauth_failed`);
    }

    const igUserId = profileData.id || igUserIdFromToken;

    if (!igUserId) {
      return NextResponse.redirect(`${origin}/audit?error=personal_account`);
    }

    const igUsername = profileData.username || `user_${igUserId}`;

    // Store/update account
    const { error: dbError } = await supabaseAdmin
      .from('instagram_accounts')
      .upsert(
        {
          ig_user_id: igUserId,
          username: igUsername,
          access_token: igAccessToken,
          token_expires_at: expiresAt,
          followers_count: profileData.followers_count || 0,
          profile_picture_url: profileData.profile_picture_url || null,
          biography: profileData.biography || '',
          media_count: profileData.media_count || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'ig_user_id' }
      );

    if (dbError) {
      console.error('[instagram/callback] DB error:', dbError);
      return NextResponse.redirect(`${origin}/audit?error=oauth_failed`);
    }

    // All intents → dashboard audit with auto-start trigger.
    // Middleware will redirect unauthenticated users to /login?next=/dashboard/audit.
    return NextResponse.redirect(`${origin}/dashboard/audit?new_connection=true`);
  } catch (err) {
    console.error('[instagram/callback] Unexpected error:', err);
    return NextResponse.redirect(`${origin}/audit?error=default`);
  }
}
