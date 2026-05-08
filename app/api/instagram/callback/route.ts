export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error || !code) {
    console.error('[instagram/callback] OAuth error:', error);
    return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
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
      return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
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
      return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
    }

    const igUserId = profileData.id || igUserIdFromToken;

    if (!igUserId) {
      return NextResponse.redirect(`${appUrl}/audit?error=personal_account`);
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
      return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
    }

    // Route based on intent
    if (intent === 'login') {
      // Check if user has any past audits
      const { data: existingAudits } = await supabaseAdmin
        .from('audits')
        .select('id')
        .eq('ig_user_id', igUserId)
        .limit(1);

      if (existingAudits && existingAudits.length > 0) {
        return NextResponse.redirect(`${appUrl}/dashboard/${igUserId}`);
      } else {
        // No past audits — send to fresh audit
        return NextResponse.redirect(`${appUrl}/audit/${igUserId}`);
      }
    }

    if (intent === 'onboarding') {
      // Redirect back to onboarding wizard with igUserId for step 2
      return NextResponse.redirect(`${appUrl}/onboarding?igUserId=${igUserId}`);
    }

    // get_started → fresh audit pipeline
    return NextResponse.redirect(`${appUrl}/audit/${igUserId}`);
  } catch (err) {
    console.error('[instagram/callback] Unexpected error:', err);
    return NextResponse.redirect(`${appUrl}/audit?error=default`);
  }
}
