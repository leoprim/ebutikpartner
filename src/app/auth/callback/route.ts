import { createServerClient } from '@supabase/ssr'
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
    
    // Use the createServerClient with Next.js cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Use type assertion to avoid TypeScript error
            const cookieValue = (cookieStore as any).get(name)?.value
            return cookieValue
          },
          set(name: string, value: string, options: any) {
            // Use type assertion to avoid TypeScript error
            (cookieStore as any).set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            // Use type assertion to avoid TypeScript error
            (cookieStore as any).delete({ name, ...options })
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
      
      // Redirect on successful login
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
    } catch (error) {
      console.error("Auth callback - Unexpected error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=An unexpected error occurred`)
    }
  }

  // If no code is present, redirect to sign-in
  console.log("Auth callback - No code present, redirecting to sign-in")
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
} 