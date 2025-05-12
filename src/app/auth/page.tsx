"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import { ArrowRight, ChromeIcon as Google, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

import { Checkbox } from "@/components/ui/checkbox"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"
import { AnimatedInput } from "@/components/ui/animated-input"

const sliderTexts = [
  {
    title: "Manage your pre-built store",
    description: "Track your delivery, edit your store, and access step-by-step guides – all in one place."
  },
  {
    title: "Boost Your Sales",
    description: "Access AI tools, marketing templates, and smart strategies to grow your revenue."
  },
  {
    title: "Connect with other store owners",
    description: "Share experiences, ask questions, and grow together in our exclusive member community."
  },
  {
    title: "Scale Your Success",
    description: "Take your business to the next level with our tailor-made solutions."
  }
]

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom")
  const mode = searchParams.get("mode")

  useEffect(() => {
    if (mode === "signup") {
      setIsSignIn(false)
    }
  }, [mode])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderTexts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Add a small delay to prevent rapid-fire requests
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Too many login attempts. Please wait a few minutes before trying again.")
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.user) {
        toast.success("Signed in successfully")
        setIsRedirecting(true)
        setTimeout(() => {
          const redirectPath = redirectedFrom || "/dashboard"
          router.push(redirectPath)
          router.refresh()
        }, 300)
        return
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("rate limit")) {
        toast.error("Too many login attempts. Please wait a few minutes before trying again.")
      } else {
        toast.error("An error occurred during sign in")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName) {
      toast.error("Please enter your full name")
      return
    }

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!password) {
      toast.error("Please enter a password")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success("Registration successful! Please check your email to confirm your account.")
        setIsSignIn(true)
        setEmail("")
        setPassword("")
        setFullName("")
        setConfirmPassword("")
      }
    } catch (error) {
      toast.error("An error occurred during registration")
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
        toast.error(error.message)
      }
    } catch (error) {
      toast.error("An error occurred during Google sign in")
    }
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderTexts.length) % sliderTexts.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderTexts.length)
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row overflow-hidden bg-white p-5">
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
              className="text-2xl font-medium text-black"
            >
              Success! Redirecting you to your dashboard...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side - Background with Logo (desktop only) */}
      <div className="relative hidden w-1/2 bg-[url(/3149495.jpg)] bg-cover md:block rounded-2xl">
        <div className="absolute top-8 left-8">
          <a href="/">
            <span className="sr-only">Home</span>
            <Image
              src="/LogoRemake_DarkGreen.svg"
              width={170}
              height={40}
              alt="StorePartner white logo"
              priority
            />
          </a>
        </div>
        <div className="flex h-full items-end">
          <div className="relative h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="flex h-full flex-col justify-end px-8 pb-12 text-left text-primary"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-medium">
                  {sliderTexts[currentSlide].title}
                </h2>
                <p className="mt-4 max-w-md text-lg font-normal">
                  {sliderTexts[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute bottom-8 right-8 flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                className="rounded-full bg-white/10 p-2 text-primary backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextSlide}
                className="rounded-full bg-white/10 p-2 text-primary backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col md:w-1/2">
        <motion.div
          className="mb-6 flex justify-center md:hidden pt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
        >
          <a href="/">
            <span className="sr-only">Home</span>
            <Image
              src="/Logo_BlackOrange.svg"
              width={136}
              height={40}
              alt="StorePartner logo"
              priority
            />
          </a>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 md:px-8 lg:px-12 xl:px-20">
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

            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isSignIn ? "signin" : "signup"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="flex flex-col space-y-2 text-center"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.05 }}
                >
                  <h1 className="text-3xl font-medium tracking-tight">
                    {isSignIn ? "Welcome back!" : "Create an account"}
                  </h1>
                  <p className="text-sm text-muted-foreground py-2 font-normal">
                    {isSignIn
                      ? "Enter your credentials to sign in to your account"
                      : "Enter your information to create your account"}
                  </p>
                </motion.div>

                <motion.div
                  className="mt-8 grid gap-6"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.10 }}
                >
                  <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="grid gap-4">
                    {!isSignIn && (
                      <div className="grid gap-2">
                        <AnimatedInput
                          id="fullName"
                          name="fullName"
                          type="text"
                          label="Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="grid gap-2">
                      <AnimatedInput
                        id="email"
                        name="email"
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <AnimatedInput
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {isSignIn && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <Label htmlFor="remember" className="text-sm font-normal">
                            Remember me
                          </Label>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-black hover:underline focus:outline-none"
                          onClick={() => setForgotOpen(true)}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                    {!isSignIn && (
                      <div className="grid gap-2">
                        <AnimatedInput
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          label="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <Button type="submit" className="mt-2 h-12" disabled={isLoading}>
                      {isLoading
                        ? isSignIn
                          ? "Signing in..."
                          : "Creating account..."
                        : isSignIn
                        ? "Sign in"
                        : "Create account"}
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
                    {isSignIn ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => {
                        setIsSignIn(!isSignIn)
                        setEmail("")
                        setPassword("")
                        setFullName("")
                        setConfirmPassword("")
                      }}
                    >
                      {isSignIn ? "Sign up" : "Sign in"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
} 