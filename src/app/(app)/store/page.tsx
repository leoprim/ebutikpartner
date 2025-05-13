"use client"

import StorePageClient from "./store-page-client"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"

export default function StorePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return <StorePageClient supabase={supabase} />
}
