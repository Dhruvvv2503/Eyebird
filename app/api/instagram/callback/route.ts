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

    // Step 1: Exchange code for short-lived token via Facebook Graph API
    const tokenResponse = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('[instagram/callback] Token exchange failed:', tokenData);
      return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
    }

    // Step 2: Get connected Instagram Business/Creator account
    // First, get the Facebook pages the user manages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesResponse.json();

    // Try to get the Instagram account connected to the first page
    let igUserId: string | null = null;
    let igUsername: string | null = null;
    let igAccessToken = tokenData.access_token;
    let igBio = '';
    let igFollowers = 0;
    let igMediaCount = 0;
    let igProfilePicture: string | null = null;

    if (pagesData.data && pagesData.data.length > 0) {
      // Get Instagram account from the first connected page
      const pageToken = pagesData.data[0].access_token;
      const pageId = pagesData.data[0].id;

      const igAccountResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
      );
      const igAccountData = await igAccountResponse.json();

      if (igAccountData.instagram_business_account?.id) {
        igUserId = igAccountData.instagram_business_account.id;

        // Get full profile
        const profileResponse = await fetch(
          `https://graph.facebook.com/v19.0/${igUserId}?fields=id,username,biography,followers_count,media_count,profile_picture_url&access_token=${pageToken}`
        );
        const profile = await profileResponse.json();

        igUsername = profile.username || `user_${igUserId}`;
        igBio = profile.biography || '';
        igFollowers = profile.followers_count || 0;
        igMediaCount = profile.media_count || 0;
        igProfilePicture = profile.profile_picture_url || null;
        igAccessToken = pageToken; // Use page token for Business API calls
      }
    }

    // Fallback: try the user's own Instagram account via Basic Display
    if (!igUserId) {
      const meResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${tokenData.access_token}`
      );
      const me = await meResponse.json();

      if (!me.id) {
        console.error('[instagram/callback] Could not identify user:', me);
        return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
      }

      igUserId = me.id;
      igUsername = me.name || `user_${me.id}`;
    }

    if (!igUserId) {
      return NextResponse.redirect(`${appUrl}/audit?error=personal_account`);
    }

    // Compute token expiry (Facebook user tokens typically last 60 days)
    const expiresIn = tokenData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

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
