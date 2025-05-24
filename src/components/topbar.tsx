"use client"
import { useEffect, useState, useRef } from "react"
import { Bell, LogOut, Menu, Settings, User } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { notificationService, Notification } from "@/services/notification"
import { useSidebar } from "@/components/ui/sidebar"
import { toast } from "react-hot-toast"

export function TopBar() {
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { toggleSidebar, isMobile } = useSidebar()
  
  // Use useRef to prevent creating multiple Supabase clients on re-renders
  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ).current

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })
  }, [supabase])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const fetchedNotifications = await notificationService.getNotifications();
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const markAsRead = async (id: string) => {
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

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
    toast.success("Du har loggats ut");
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Instrumentpanel"
      case "/guides-library":
        return "Guidesbibliotek"
      case "/community":
        return "Gemenskap"
      case "/store":
        return "Butik"
      case "/admin/videos":
        return "Videohantering"
      case "/admin/dashboard":
        return "Adminpanel"
      case "/notifications":
        return "Notifieringar"
      case "/blog-post-generator":
        return "Bloggenerator"
      case "/ai-tools":
        return "AI-verktyg"
      default:
        return "StorePartner"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just nu';
    } else if (diffInHours < 24) {
      return diffInHours === 1 
        ? `${diffInHours} timme sedan`
        : `${diffInHours} timmar sedan`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1
        ? `${diffInDays} dag sedan`
        : `${diffInDays} dagar sedan`;
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 w-full">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full bg-red-500 text-white"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifieringar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifieringar</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-auto py-1 px-2"
                >
                  Markera alla som lästa
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 hover:bg-accent cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Inga notifieringar
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => router.push('/notifications')}
              >
                Visa alla notifieringar
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:flex md:items-center md:gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </>
          ) : (
            <div className="flex flex-col items-end">
              
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
              <span className="sr-only">Användarmeny</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mitt Konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Inställningar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logga ut</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </header>
  )
}
