"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChromeIcon as Google } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import supabase from "@/lib/supabase"

export default function SignUpPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Successfully signed out")
      window.location.reload()
    } catch (error) {
      toast.error("An error occurred during sign out")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

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
        router.push("/sign-in")
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
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            redirect_to: "/dashboard"
          }
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error("An error occurred during Google sign in")
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left side - Background with Logo (desktop only) */}
      <div className="relative hidden w-1/2 bg-gradient-to-br from-violet-500 to-purple-700 md:block">
        <div className="absolute top-8 left-8">
          <a href="/">
            <span className="sr-only">Home</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="176" height="40" fill="none" viewBox="0 0 176 40"><path fill="#fff" fill-rule="evenodd" d="M15 28a5 5 0 0 1-5-5V0H0v23c0 8.284 6.716 15 15 15h11V28H15ZM45 10a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-19 9C26 8.507 34.507 0 45 0s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM153 10a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm-19 9c0-10.493 8.507-19 19-19s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM85 0C74.507 0 66 8.507 66 19s8.507 19 19 19h28c1.969 0 3.868-.3 5.654-.856L124 40l5.768-10.804A19.007 19.007 0 0 0 132 20.261V19c0-10.493-8.507-19-19-19H85Zm37 19a9 9 0 0 0-9-9H85a9 9 0 1 0 0 18h28a9 9 0 0 0 9-8.93V19Z" clip-rule="evenodd"></path><path fill="#fff" d="M176 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path></svg>
          </a>
        </div>
        <div className="flex h-full items-center justify-center">
          <div className="relative h-full w-full">
            <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white">
              <h2 className="text-3xl font-bold">Join Our Community</h2>
              <p className="mt-4 max-w-md text-lg">
                Create an account to access all features and start your journey with us.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 md:w-1/2 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo for mobile only */}
          <div className="mb-6 flex justify-center md:hidden">
            <a href="/">
              <span className="sr-only">Home</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="176" height="40" fill="none" viewBox="0 0 176 40"><path fill="#283841" fill-rule="evenodd" d="M15 28a5 5 0 0 1-5-5V0H0v23c0 8.284 6.716 15 15 15h11V28H15ZM45 10a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-19 9C26 8.507 34.507 0 45 0s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM153 10a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm-19 9c0-10.493 8.507-19 19-19s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM85 0C74.507 0 66 8.507 66 19s8.507 19 19 19h28c1.969 0 3.868-.3 5.654-.856L124 40l5.768-10.804A19.007 19.007 0 0 0 132 20.261V19c0-10.493-8.507-19-19-19H85Zm37 19a9 9 0 0 0-9-9H85a9 9 0 1 0 0 18h28a9 9 0 0 0 9-8.93V19Z" clip-rule="evenodd"></path><path fill="#283841" d="M176 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path></svg>
            </a>
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your information to create your account</p>
          </div>

          <div className="mt-8 grid gap-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" type="text" placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" />
              </div>
              <Button type="submit" className="mt-2">
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
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
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <Google className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 