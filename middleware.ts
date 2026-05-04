import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware — explicitly allows all known bots and crawlers through.
 * Prevents Vercel edge protection from blocking Meta/Facebook crawlers
 * on legal pages required for Meta App Review.
 */

const ALLOWED_BOTS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandex',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
];

export function middleware(request: NextRequest) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = ALLOWED_BOTS.some((bot) => ua.includes(bot));

  const response = NextResponse.next();

  // For bots and all public legal/policy pages — set explicit permissive headers
  if (isBot || request.nextUrl.pathname.startsWith('/data-deletion') ||
      request.nextUrl.pathname.startsWith('/privacy') ||
      request.nextUrl.pathname.startsWith('/terms')) {
    response.headers.set('X-Robots-Tag', 'all');
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    // Remove any protection headers that could signal blocking
    response.headers.delete('X-Frame-Options');
  }

  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
