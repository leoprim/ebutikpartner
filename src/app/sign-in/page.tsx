"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, ChromeIcon as Google } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom")

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting to sign in with:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        toast.error(error.message)
        return
      }

      console.log("Sign in response:", data)
      if (data.session) {
        console.log("Session created successfully:", data.session)
        // Verify the session was actually created
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Verified session:", session)

        if (session) {
          toast.success("Signed in successfully")
          setIsRedirecting(true)
          setTimeout(() => {
            const redirectPath = redirectedFrom || "/dashboard"
            console.log("Redirecting to:", redirectPath)
            router.push(redirectPath)
            router.refresh()
          }, 1200)
          return
        } else {
          console.error("Session verification failed")
          toast.error("Failed to create session")
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect_to=${redirectedFrom || "/dashboard"}`,
        },
      })

      if (error) {
        console.error("Google sign in error:", error)
        toast.error(error.message)
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      toast.error("An error occurred during Google sign in")
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-brand-deepsea"
            >
              Redirecting...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left side - Background with Logo (desktop only) */}
      <div className="relative hidden w-1/2 bg-primary md:block">
        <div className="absolute top-8 left-8">
          <a href="/">
            <span className="sr-only">Home</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="176" height="40" fill="none" viewBox="0 0 176 40"><path fill="#fff" fill-rule="evenodd" d="M15 28a5 5 0 0 1-5-5V0H0v23c0 8.284 6.716 15 15 15h11V28H15ZM45 10a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-19 9C26 8.507 34.507 0 45 0s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM153 10a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm-19 9c0-10.493 8.507-19 19-19s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM85 0C74.507 0 66 8.507 66 19s8.507 19 19 19h28c1.969 0 3.868-.3 5.654-.856L124 40l5.768-10.804A19.007 19.007 0 0 0 132 20.261V19c0-10.493-8.507-19-19-19H85Zm37 19a9 9 0 0 0-9-9H85a9 9 0 1 0 0 18h28a9 9 0 0 0 9-8.93V19Z" clip-rule="evenodd"></path><path fill="#fff" d="M176 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path></svg>
          </a>
        </div>
        <div className="flex h-full items-center justify-center">
          <div className="relative h-full w-full">
            <motion.div
              className="flex h-full flex-col items-center justify-center px-8 text-center text-white"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
            >
              <h2 className="text-3xl font-bold">Discover Amazing Features</h2>
              <p className="mt-4 max-w-md text-lg">
                Sign in to access your personalized dashboard and explore all our platform has to offer.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 md:w-1/2 md:px-8 lg:px-12 xl:px-20">
        <motion.div
          className="mx-auto w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          <motion.div
            className="mb-6 flex justify-center md:hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
          >
            <a href="/">
              <span className="sr-only">Home</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="176" height="40" fill="none" viewBox="0 0 176 40"><path fill="#283841" fill-rule="evenodd" d="M15 28a5 5 0 0 1-5-5V0H0v23c0 8.284 6.716 15 15 15h11V28H15ZM45 10a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-19 9C26 8.507 34.507 0 45 0s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM153 10a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm-19 9c0-10.493 8.507-19 19-19s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM85 0C74.507 0 66 8.507 66 19s8.507 19 19 19h28c1.969 0 3.868-.3 5.654-.856L124 40l5.768-10.804A19.007 19.007 0 0 0 132 20.261V19c0-10.493-8.507-19-19-19H85Zm37 19a9 9 0 0 0-9-9H85a9 9 0 1 0 0 18h28a9 9 0 0 0 9-8.93V19Z" clip-rule="evenodd"></path><path fill="#283841" d="M176 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path></svg>
            </a>
          </motion.div>
          <motion.div
            className="flex flex-col space-y-2 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
          </motion.div>
          <motion.div
            className="mt-8 grid gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.10 }}
          >
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm text-black hover:underline focus:outline-none"
                    onClick={() => setForgotOpen(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="mt-2 py-5" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid gap-4">
              <Button variant="outline" className="w-full py-5" onClick={handleGoogleSignIn}>
                <Google className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
}
