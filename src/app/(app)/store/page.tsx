"use client"

import { useEffect, useState } from "react"
import StorePageClient from "./store-page-client"
import type { User } from "@supabase/supabase-js"
import { useSupabase } from "@/components/supabase-provider"

export default function StorePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    if (!supabase) {
      setError("Supabase client not initialized")
      setIsLoading(false)
      return
    }
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Supabase getUser:', { user, error })
      setUser(user)
      if (error) setError(error.message)
      setIsLoading(false)
    }
    checkUser()
  }, [supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>No authenticated user found. {error && <span>Error: {error}</span>}</div>
  }

  return <StorePageClient user={user} />
}
