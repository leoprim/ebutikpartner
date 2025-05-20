import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";

export default function OnboardingModal({ open, onComplete, user }: {
  open: boolean;
  onComplete: () => void;
  user: any;
}) {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Pre-fill if user has a name (shouldn't show if so, but for safety)
  React.useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      setLoading(false);
      return;
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    try {
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (metaError) throw metaError;
      // Update password
      const { error: passError } = await supabase.auth.updateUser({
        password
      });
      if (passError) throw passError;
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName
      });
      // Force refresh session
      await supabase.auth.refreshSession();
      onComplete();
    } catch (err: any) {
      setError(err.message || "Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  // Only show if user is present and missing full_name
  if (!user || user.user_metadata?.full_name) return null;

  return (
    <Dialog open={open}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Välkommen! Slutför din registrering</h2>
          <div className="mb-4">
            <Label htmlFor="fullName">Fullständigt namn</Label>
            <Input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="mt-1"
              placeholder="Ditt namn"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Lösenord (minst 6 tecken)</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1"
              placeholder="Välj ett lösenord"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1"
              placeholder="Bekräfta lösenordet"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sparar..." : "Spara och fortsätt"}
          </Button>
        </form>
      </div>
    </Dialog>
  );
} 