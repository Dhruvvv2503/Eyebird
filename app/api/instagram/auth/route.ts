export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAppId, getInstagramRedirectUri, getAppUrl } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const appId = getInstagramAppId();
    const appUrl = getAppUrl();

    if (!appId) {
      return NextResponse.redirect(`${appUrl}/audit?error=instagram_not_configured`);
    }

    // Read intent: 'get_started' | 'login'
    const intent = request.nextUrl.searchParams.get('intent') || 'get_started';
    const state = Buffer.from(JSON.stringify({ intent })).toString('base64');

    const redirectUri = getInstagramRedirectUri();
    const oauthUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_messages,instagram_business_content_publish&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(oauthUrl);
  } catch (err) {
    console.error('[instagram/auth] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
