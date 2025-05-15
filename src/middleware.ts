import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Authentication-related paths that don't require a session
const publicPaths = ['/auth', '/auth/callback', '/sign-in', '/sign-up']
// Next.js system paths and static files that should be excluded
const systemPaths = ['/_next', '/favicon.ico']
// Image extensions to exclude
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico']

export async function middleware(req: NextRequest) {
  // Initialize response
  const res = NextResponse.next()
  
  const { pathname } = req.nextUrl
  
  // Skip middleware for system paths and api routes
  if (systemPaths.some(path => pathname.startsWith(path)) || 
      pathname.startsWith('/api')) {
    return res
  }
  
  // Skip middleware for image files
  if (imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
    return res
  }

  // Create Supabase client using cookies from request
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
          res.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )
  
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Check if current path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
    
    // Redirect unauthenticated users trying to access protected routes
    if (!session && !isPublicPath) {
      const redirectUrl = new URL('/auth', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Redirect authenticated users trying to access auth pages
    if (session && isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Continue with the request
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/',
    '/:path*',
  ],
} 