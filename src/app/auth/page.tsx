"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { ArrowRight, ChromeIcon as Google, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

import { Checkbox } from "@/components/ui/checkbox"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"
import { AnimatedInput } from "@/components/ui/animated-input"
import { addToast } from "@heroui/react"

const sliderTexts = [
  {
    title: "Hantera din förbyggda butik",
    description: "Spåra din leverans, redigera din butik och få tillgång till steg-för-steg-guider – allt på ett ställe."
  },
  {
    title: "Öka din försäljning",
    description: "Få tillgång till AI-verktyg, marknadsföringsmallar och smarta strategier för att öka din omsättning."
  },
  {
    title: "Anslut med andra butiksägare",
    description: "Dela erfarenheter, ställ frågor och väx tillsammans i vår exklusiva medlemsgemenskap."
  },
  {
    title: "Skala din framgång",
    description: "Ta din verksamhet till nästa nivå med våra skräddarsydda lösningar."
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
          addToast({ title: "För många inloggningsförsök. Vänta några minuter innan du försöker igen.", color: "danger" })
        } else {
          addToast({ title: error.message, color: "danger" })
        }
        return
      }

      if (data.user) {
        addToast({ title: "Inloggningen lyckades", color: "success" })
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
        addToast({ title: "För många inloggningsförsök. Vänta några minuter innan du försöker igen.", color: "danger" })
      } else {
        addToast({ title: "Ett fel uppstod vid inloggning", color: "danger" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName) {
      addToast({ title: "Vänligen ange ditt fullständiga namn", color: "danger" })
      return
    }

    if (!email) {
      addToast({ title: "Vänligen ange din e-postadress", color: "danger" })
      return
    }

    if (!email.includes("@")) {
      addToast({ title: "Vänligen ange en giltig e-postadress", color: "danger" })
      return
    }

    if (!password) {
      addToast({ title: "Vänligen ange ett lösenord", color: "danger" })
      return
    }

    if (password.length < 6) {
      addToast({ title: "Lösenordet måste vara minst 6 tecken långt", color: "danger" })
      return
    }

    if (password !== confirmPassword) {
      addToast({ title: "Lösenorden matchar inte", color: "danger" })
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
        addToast({ title: error.message, color: "danger" })
        return
      }

      if (data.user) {
        addToast({ title: "Registreringen lyckades! Kontrollera din e-post för att bekräfta ditt konto.", color: "success" })
        setIsSignIn(true)
        setEmail("")
        setPassword("")
        setFullName("")
        setConfirmPassword("")
      }
    } catch (error) {
      addToast({ title: "Ett fel uppstod vid registreringen", color: "danger" })
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
        addToast({ title: error.message, color: "danger" })
      }
    } catch (error) {
      addToast({ title: "Ett fel uppstod vid inloggning med Google", color: "danger" })
    }
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderTexts.length) % sliderTexts.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderTexts.length)
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row md:gap-6 overflow-hidden bg-white p-5">
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
              Lyckades! Omdirigerar dig till din instrumentpanel...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side - Background with Logo (desktop only) */}
      <div className="hidden md:flex md:w-1/2 flex-col relative p-10 bg-[url(/3149495.jpg)] bg-cover bg-center rounded-2xl">
        <div className="absolute inset-0 bg-green-950/20 rounded-2xl"></div>
        <div className="relative mb-auto">
          <Image
            src="/LogoNewRemake_White.svg"
            width={180}
            height={48}
            alt="EbutikPartner logo"
            priority
            style={{ height: 'auto' }}
          />
        </div>
        
        <div className="relative mt-auto">
          <div className="mb-8">
            <motion.h2 
              key={`title-${currentSlide}`} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-medium mb-3 text-white"
            >
              {sliderTexts[currentSlide].title}
            </motion.h2>
            <motion.p 
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-white/80 max-w-md"
            >
              {sliderTexts[currentSlide].description}
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevSlide} className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-2">
              {sliderTexts.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/30'}`}
                ></div>
              ))}
            </div>
            <button onClick={handleNextSlide} className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Sign In/Sign Up form */}
      <div className="flex flex-col justify-center items-center md:w-1/2 p-6 md:px-16 md:py-10">
        <div className="text-center md:text-center mb-8 max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="md:hidden mb-6 flex justify-center w-full">
            <Image
              src="/LogoNewRemake_DarkGreen.svg"
              width={160}
              height={48}
              alt="EbutikPartner logo"
              priority
              style={{ height: 'auto' }}
            />
          </div>
          <h1 className="text-2xl font-medium">{isSignIn ? 'Välkommen tillbaka!' : 'Skapa ditt konto'}</h1>
          <p className="text-muted-foreground mt-2">
            {isSignIn ? 'Fyll i dina uppgifter nedan för att fortsätta' : 'Fyll i dina uppgifter för att komma igång.'}
          </p>
        </div>

        <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-5 max-w-md mx-auto w-full relative">
          <motion.div
            layout
            className="space-y-5"
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            <AnimatePresence mode="wait">
              {!isSignIn && (
                <motion.div
                  key="fullname"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    opacity: { duration: 0.2 }, 
                    height: { duration: 0.3 } 
                  }}
                >
                  <div>
                    <AnimatedInput
                      id="full-name"
                      label="Fullständigt namn"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      type="text"
                      placeholder=" "
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              layout
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: isSignIn ? 0 : 0.1 }}
            >
              <div>
                <AnimatedInput
                  id="email"
                  label="E-post"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  type="email"
                  placeholder=" "
                />
              </div>
            </motion.div>

            <motion.div
              layout
              key="password"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: isSignIn ? 0.1 : 0.2 }}
            >
              <div>
                <AnimatedInput
                  id="password"
                  label="Lösenord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  type="password"
                  placeholder=" "
                />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {isSignIn ? (
                <motion.div
                  key="remember-me"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    opacity: { duration: 0.2 }, 
                    height: { duration: 0.3 } 
                  }}
                >
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Kom ihåg mig
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs text-primary/80 hover:text-primary transition-colors"
                    >
                      Glömt lösenord?
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    opacity: { duration: 0.2 }, 
                    height: { duration: 0.3 } 
                  }}
                >
                  <div>
                    <AnimatedInput
                      id="confirm-password"
                      label="Bekräfta lösenord"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      type="password"
                      placeholder=" "
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              layout
              key="submit-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: isSignIn ? 0.3 : 0.4 }}
            >
              <Button
                type="submit"
                className="w-full bg-[#1e4841] hover:bg-[#1e4841]/90 text-white py-6 transition-colors"
                disabled={isLoading}
              >
                {isSignIn 
                  ? (isLoading ? "Loggar in..." : "Logga in") 
                  : (isLoading ? "Skapar konto..." : "Skapa konto")}
              </Button>
            </motion.div>

            <motion.div
              layout
              key="divider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: isSignIn ? 0.4 : 0.5 }}
            >
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">
                    eller
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              layout
              key="google-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: isSignIn ? 0.5 : 0.6 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full py-6 flex items-center justify-center gap-2 border border-input hover:bg-muted/30 transition-colors"
                disabled={isLoading}
              >
                <Google className="h-4 w-4" />
                <span>Fortsätt med Google</span>
              </Button>
            </motion.div>

            <motion.div
              layout
              key="account-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: isSignIn ? 0.6 : 0.7 }}
            >
              <div className="mt-6 text-center text-sm">
                {isSignIn ? (
                  <div>
                    Har du inget konto?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignIn(false)}
                      className="text-primary/80 hover:text-primary transition-colors"
                    >
                      Skapa konto
                    </button>
                  </div>
                ) : (
                  <div>
                    Har du redan ett konto?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignIn(true)}
                      className="text-primary/80 hover:text-primary transition-colors"
                    >
                      Logga in
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </form>
      </div>

      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
} 