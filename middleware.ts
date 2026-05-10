import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/onboarding',
  '/privacy',
  '/terms',
  '/data-deletion',
  '/account-deleted',
  '/api/auth/callback',
  '/api/instagram/callback',
  '/api/instagram/auth',
  '/api/preview-score',
  '/api/webhooks',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // All API routes pass through without interception
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({ request })
  }

  const isPublic = PUBLIC_PATHS.some(path =>
    pathname === path ||
    pathname.startsWith(path + '/')
  )

  if (isPublic) return NextResponse.next({ request })

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

  // Protected routes — auth required
  const isProtectedRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')

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
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
}
