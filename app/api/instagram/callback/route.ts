export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const appUrl = getAppUrl();

    if (error) {
      return NextResponse.redirect(`${appUrl}/audit?error=oauth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${appUrl}/audit?error=default`);
    }

    // In production: exchange code for access token via Facebook Graph API
    // For this build, we route to the audit page with a mock user ID
    const mockIgUserId = 'demo-user-123';
    return NextResponse.redirect(`${appUrl}/audit/${mockIgUserId}`);
  } catch (err) {
    console.error('[instagram/callback] Error:', err);
    const appUrl = getAppUrl();
    return NextResponse.redirect(`${appUrl}/audit?error=default`);
  }
}
