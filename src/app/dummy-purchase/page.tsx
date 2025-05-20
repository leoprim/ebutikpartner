"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"

export default function DummyPurchasePage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      // Send magic link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError

      // Create a store_orders record (with email, user_id will be updated after signup)
      const { error: orderError } = await supabase.from("store_orders").insert([
        {
          client_email: email,
          status: "Väntar",
          price: 9995,
          niche: "",
          store_name: "",
          client_name: "",
        },
      ])
      if (orderError) throw orderError

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Något gick fel. Försök igen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Dummy Store Purchase</h1>
        {success ? (
          <div className="text-green-600 font-medium">
            En magisk länk har skickats till <b>{email}</b>. Kolla din e-post för att logga in och slutföra din butik!
          </div>
        ) : (
          <form onSubmit={handlePurchase} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="din@email.se"
                disabled={loading}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Skickar..." : "Simulera köp och skicka magisk länk"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
} 