import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/audit?error=default`);
  }

  try {
    // In a real app, exchange 'code' for short-lived token, then long-lived token
    // const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?...`)
    // const { access_token } = await tokenResponse.json();
    
    // For this build, we mock the success path
    const mockIgUserId = 'demo-user-123';
    
    // Redirect to the audit generation/display page
    return NextResponse.redirect(`${appUrl}/audit/${mockIgUserId}`);
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(`${appUrl}/audit?error=default`);
  }
}
