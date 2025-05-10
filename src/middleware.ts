import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip middleware for static files and public assets
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.startsWith('/images') ||
    req.nextUrl.pathname.startsWith('/Logo_') ||
    req.nextUrl.pathname.endsWith('.jpg') ||
    req.nextUrl.pathname.endsWith('.png') ||
    req.nextUrl.pathname.endsWith('.svg') ||
    req.nextUrl.pathname.endsWith('.ico')
  ) {
    return NextResponse.next()
  }

  // Skip middleware for auth routes
  if (
    req.nextUrl.pathname.startsWith('/auth') ||
    req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/sign-up')
  ) {
    return NextResponse.next()
  }

  // Create a response object that we can modify
  const res = NextResponse.next()
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Middleware session error:', error)
      return res
    }

    // Get the pathname of the request
    const path = req.nextUrl.pathname

    // Define protected routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/admin',
      '/guides-library',
      '/api/video-progress'
    ]

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

    // If it's a protected route and there's no user, redirect to sign-in
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/auth', req.url)
      redirectUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Return the response with the modified cookies
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 