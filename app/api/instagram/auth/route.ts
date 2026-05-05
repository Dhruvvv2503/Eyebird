export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getInstagramAppId, getInstagramRedirectUri, getAppUrl } from '@/lib/env';

export async function GET() {
  try {
    const appId = getInstagramAppId();
    const appUrl = getAppUrl();

    if (!appId) {
      // Instagram not configured — send user back to audit page with clear message
      return NextResponse.redirect(`${appUrl}/audit?error=instagram_not_configured`);
    }

    const redirectUri = getInstagramRedirectUri();
    const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_messages,instagram_business_content_publish`;

    return NextResponse.redirect(oauthUrl);
  } catch (err) {
    console.error('[instagram/auth] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
