"use client"

import { useEffect } from "react"
import { addToast } from "@heroui/toast"

export function ToastHandler() {
  useEffect(() => {
    // Check for sign-in success flag
    const showSignInSuccess = localStorage.getItem("showSignInSuccess")
    if (showSignInSuccess) {
      addToast({
        title: "Inloggningen lyckades. Välkomen tillbaka!",
        variant: "solid",
        color: "success"
      })
      localStorage.removeItem("showSignInSuccess")
    }
  }, [])

  return null
} 