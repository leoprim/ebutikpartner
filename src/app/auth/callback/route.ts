import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

  console.log("Auth callback - Code:", code)
  console.log("Auth callback - Redirect to:", redirectTo)

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Auth callback - Error exchanging code:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=${error.message}`)
      }

      // Create a response with the redirect
      const response = NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
      
      // Get all cookies from the cookie store
      const allCookies = cookieStore.getAll()
      
      // Set all cookies in the response
      allCookies.forEach((cookie: RequestCookie) => {
        response.cookies.set({
          name: cookie.name,
          value: cookie.value,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
      })

      return response
    } catch (error) {
      console.error("Auth callback - Unexpected error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=An unexpected error occurred`)
    }
  }

  // If no code is present, redirect to sign-in
  console.log("Auth callback - No code present, redirecting to sign-in")
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
} 