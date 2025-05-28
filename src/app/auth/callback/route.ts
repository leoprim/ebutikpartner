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
    const cookieStore = await cookies()
    
    // Create Supabase server client with proper cookie handling
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
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Auth callback - Error exchanging code:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=${error.message}`)
      }

      if (user) {
        // Find and update any store orders with matching email but no user_id
        const { error: updateError } = await supabase
          .from('store_orders')
          .update({ user_id: user.id })
          .eq('client_email', user.email)
          .is('user_id', null)

        if (updateError) {
          console.error("Auth callback - Error updating store order:", updateError)
        }
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