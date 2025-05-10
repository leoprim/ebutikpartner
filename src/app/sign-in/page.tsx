"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom")

  useEffect(() => {
    router.replace(`/auth${redirectedFrom ? `?redirectedFrom=${redirectedFrom}` : ""}`)
  }, [router, redirectedFrom])

  return null
}
