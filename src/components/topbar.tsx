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
import { createBrowserClient } from "@supabase/ssr"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, usePathname } from "next/navigation"
import SettingsModal from "@/components/settings-modal"

export function TopBar() {
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/guides-library":
        return "Guides Library"
      case "/community":
        return "Community"
      case "/store":
        return "Store"
      case "/admin/videos":
        return "Video Management"
      case "/admin/dashboard":
        return "Admin Dashboard"
      default:
        return "StorePartner"
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex md:items-center md:gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Avatar className="h-full w-full">
                  {isLoading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    <>
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={name}
                        className="object-cover"
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </>
                  )}
                </Avatar>
              </div>
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
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
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
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </header>
  )
}
