"use client"
import { useEffect, useState } from "react"
import { LogOut, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function TopBar() {
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClientComponentClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })
  }, [])

  const isLoading = user === undefined
  const email = user?.email || ""
  const name = (user?.user_metadata?.full_name as string | undefined) || email?.split("@")[0] || ""
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) || undefined

  const handleSignOut = async () => {
    const supabase = createClientComponentClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Error signing out: " + error.message)
      return
    }
    toast.success("Signed out successfully")
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex md:items-center md:gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <>
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </>
                )}
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
