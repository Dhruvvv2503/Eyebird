export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error || !code) {
    console.error('[instagram/callback] OAuth error:', error);
    return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
  }

  try {
    const appId = process.env.INSTAGRAM_APP_ID!;
    const appSecret = process.env.INSTAGRAM_APP_SECRET!;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;

    // Step 1: Exchange code for short-lived token via Instagram API
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
    // Instagram direct login sometimes provides user_id in the token exchange response
    const igUserIdFromToken = tokenData.user_id; 

    // Step 2: Exchange for long-lived token (valid for 60 days)
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
    );
    const longLivedData = await longLivedResponse.json();
    
    const igAccessToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000; // default 60 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Step 3: Fetch the user's profile data
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
    const igBio = profileData.biography || '';
    const igFollowers = profileData.followers_count || 0;
    const igMediaCount = profileData.media_count || 0;
    const igProfilePicture = profileData.profile_picture_url || null;

    // Store in Supabase
    const { error: dbError } = await supabaseAdmin
      .from('instagram_accounts')
      .upsert(
        {
          ig_user_id: igUserId,
          username: igUsername,
          access_token: igAccessToken,
          token_expires_at: expiresAt,
          followers_count: igFollowers,
          profile_picture_url: igProfilePicture,
          biography: igBio,
          media_count: igMediaCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'ig_user_id' }
      );

    if (dbError) {
      console.error('[instagram/callback] DB error:', dbError);
      return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
    }

    return NextResponse.redirect(`${appUrl}/audit/${igUserId}`);
  } catch (err) {
    console.error('[instagram/callback] Unexpected error:', err);
    return NextResponse.redirect(`${appUrl}/audit?error=default`);
  }
}
