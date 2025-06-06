import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const cookieStoreResolved = await cookieStore
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStoreResolved.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStoreResolved.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStoreResolved.delete({ name, ...options })
        },
      },
    }
  )
} 