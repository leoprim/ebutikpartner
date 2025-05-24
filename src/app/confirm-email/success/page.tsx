"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import supabase from "@/lib/supabase"

export default function EmailConfirmationSuccess() {
  const router = useRouter()
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Set window size for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    // Check for session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        toast.error("Failed to get session. Please try signing in again.")
        router.push("/sign-in")
        return
      }

      if (session) {
        toast.success("Successfully logged in!")
        router.push("/dashboard")
      }
    }

    checkSession()

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      {showConfetti && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />
      )}

      <Card className="mx-auto max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
            </motion.div>
          </div>

          <motion.h1
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Email Confirmed!
          </motion.h1>
        </CardHeader>

        <CardContent>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Thank you for confirming your email address. Your account is now fully activated and you can access all
            features of our platform.
          </motion.p>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Button asChild size="lg" className="px-8">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </div>
  )
}
