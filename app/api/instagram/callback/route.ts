export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  // Read the Supabase session — the browser carries cookies through Meta's redirect
  let userId: string | null = null;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  } catch {
    userId = null;
  }

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

    // Store/update account — include user_id so the dashboard can find it
    const upsertPayload: Record<string, any> = {
      ig_user_id: igUserId,
      username: igUsername,
      access_token: igAccessToken,
      token_expires_at: expiresAt,
      followers_count: profileData.followers_count || 0,
      profile_picture_url: profileData.profile_picture_url || null,
      biography: profileData.biography || '',
      media_count: profileData.media_count || 0,
      updated_at: new Date().toISOString(),
    };
    if (userId) {
      upsertPayload.user_id = userId;
    }

    const { error: dbError } = await supabaseAdmin
      .from('instagram_accounts')
      .upsert(upsertPayload, { onConflict: 'ig_user_id' });

    if (dbError) {
      console.error('[instagram/callback] DB error:', dbError);
      return NextResponse.redirect(`${origin}/audit?error=oauth_failed`);
    }

    // After successfully storing the token in Supabase:
    return NextResponse.redirect(`${origin}/dashboard?instagram_connected=true`);
  } catch (err) {
    console.error('[instagram/callback] Unexpected error:', err);
    return NextResponse.redirect(`${origin}/audit?error=default`);
  }
}
