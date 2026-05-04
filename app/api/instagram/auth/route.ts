import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;
  
  if (!appId) {
    // Fallback for demo mode if no app ID configured
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback?code=mock_demo_code`);
  }

  // Meta OAuth URL for Instagram Basic Display / Graph API
  // Note: For full insights, the user needs to authenticate via Facebook Login for Business
  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&display=page&extras={"setup":{"channel":"IG_API_ONBOARDING"}}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement`;

  return NextResponse.redirect(oauthUrl);
}
