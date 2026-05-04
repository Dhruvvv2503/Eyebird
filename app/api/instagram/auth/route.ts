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
    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&display=page&extras={"setup":{"channel":"IG_API_ONBOARDING"}}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement`;

    return NextResponse.redirect(oauthUrl);
  } catch (err) {
    console.error('[instagram/auth] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
