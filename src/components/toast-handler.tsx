"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function ToastHandler() {
  useEffect(() => {
    // Check for sign-in success flag
    const showSignInSuccess = localStorage.getItem("showSignInSuccess")
    if (showSignInSuccess) {
      toast.success("Successfully signed in!")
      localStorage.removeItem("showSignInSuccess")
    }
  }, [])

  return null
} 