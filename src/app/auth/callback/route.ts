import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

  console.log("Auth callback - Code:", code)
  console.log("Auth callback - Redirect to:", redirectTo)

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Auth callback - Error exchanging code:", error)
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${error.message}`)
      }

      console.log("Auth callback - Session created:", session)
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
    } catch (error) {
      console.error("Auth callback - Unexpected error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=An unexpected error occurred`)
    }
  }

  // If no code is present, redirect to sign-in
  console.log("Auth callback - No code present, redirecting to sign-in")
  return NextResponse.redirect(`${requestUrl.origin}/sign-in`)
} 