import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // API routes (including /api/instagram/callback) must never be intercepted —
  // Meta calls the Instagram callback without any user session cookie.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Protected routes — auth required
  const isProtectedRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/audit') ||
    pathname.startsWith('/dashboard/settings') ||
    pathname.startsWith('/dashboard/automations') ||
    pathname.startsWith('/dashboard/smart-reply') ||
    pathname.startsWith('/dashboard/contacts') ||
    pathname.startsWith('/dashboard/analytics') ||
    pathname.startsWith('/onboarding')

  // Auth routes — redirect to dashboard if already logged in
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/audit',
    '/dashboard/audit/:path*',
    '/dashboard/settings',
    '/dashboard/settings/:path*',
    '/dashboard/automations',
    '/dashboard/automations/:path*',
    '/dashboard/smart-reply',
    '/dashboard/smart-reply/:path*',
    '/dashboard/contacts',
    '/dashboard/contacts/:path*',
    '/dashboard/analytics',
    '/dashboard/analytics/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/login',
    '/signup',
  ],
}
