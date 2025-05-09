import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const response = NextResponse.next()

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    const path = request.nextUrl.pathname

    console.log("Middleware - Path:", path)
    console.log("Middleware - Session exists:", !!session)

    // If accessing dashboard without a session, redirect to sign-in
    if (!session && path.startsWith("/dashboard")) {
      console.log("Middleware - No session, redirecting to sign-in")
      const redirectUrl = new URL("/sign-in", request.url)
      redirectUrl.searchParams.set("redirectedFrom", path)
      return NextResponse.redirect(redirectUrl)
    }

    // If signed in, prevent access to /sign-in and /sign-up
    if (session && (path === "/sign-in" || path === "/sign-up")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  } catch (error) {
    // If there's an error, redirect to sign-in
    console.error("Middleware error:", error)
    const redirectUrl = new URL("/sign-in", request.url)
    redirectUrl.searchParams.set("error", "Authentication error")
    return NextResponse.redirect(redirectUrl)
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
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
} 