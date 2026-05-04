import { NextRequest, NextResponse } from 'next/server';
import { LEGAL_CONFIG } from '@/app/lib/legal-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Meta/Facebook Data Deletion Callback Endpoint
 *
 * Meta sends a POST request with a signed_request parameter when a user
 * deletes their Facebook/Instagram account. This endpoint:
 *   1. Parses and verifies the signed_request
 *   2. Returns the required JSON response with url + confirmation_code
 *
 * Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and add padding
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

async function verifySignedRequest(signedRequest: string, appSecret: string): Promise<Record<string, unknown> | null> {
  try {
    const [encodedSig, payload] = signedRequest.split('.');
    if (!encodedSig || !payload) return null;

    // Verify HMAC-SHA256 signature
    const { createHmac } = await import('crypto');
    const expectedSig = createHmac('sha256', appSecret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (expectedSig !== encodedSig) {
      console.warn('[data-deletion] Signature mismatch — possible spoofed request');
      return null;
    }

    return JSON.parse(base64UrlDecode(payload));
  } catch (err) {
    console.error('[data-deletion] Error verifying signed_request:', err);
    return null;
  }
}

// ── GET ── Browser visits the instructions page directly
export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'Data deletion instructions available at https://www.eyebird.in/data-deletion/' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'all',
      },
    }
  );
}

// ── POST ── Meta sends signed_request when user deletes their account
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let signedRequest: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const body = await request.text();
      const params = new URLSearchParams(body);
      signedRequest = params.get('signed_request');
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      signedRequest = body.signed_request;
    }

    // Generate a unique confirmation code
    const confirmationCode = `EB-DEL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const deletionUrl = `https://www.${LEGAL_CONFIG.domain}/data-deletion/`;

    // If we have a signed_request and app secret, verify it
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    if (signedRequest && appSecret) {
      const data = await verifySignedRequest(signedRequest, appSecret);
      if (!data) {
        return NextResponse.json(
          { error: 'Invalid signed_request' },
          { status: 400 }
        );
      }
      console.log(`[data-deletion] Deletion request for user_id: ${data.user_id}, code: ${confirmationCode}`);
    } else if (signedRequest && !appSecret) {
      // App secret not configured — still respond with 200 so Meta doesn't block
      console.warn('[data-deletion] INSTAGRAM_APP_SECRET not set, skipping verification');
    }

    // Required response format per Meta docs
    return NextResponse.json(
      {
        url: deletionUrl,
        confirmation_code: confirmationCode,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex',
        },
      }
    );
  } catch (err) {
    console.error('[data-deletion] POST handler error:', err);
    // Always return 200 to Meta — even on error — so they don't block the app
    return NextResponse.json(
      {
        url: `https://www.${LEGAL_CONFIG.domain}/data-deletion/`,
        confirmation_code: `EB-DEL-ERR-${Date.now()}`,
      },
      { status: 200 }
    );
  }
}
