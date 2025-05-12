"use client"

import * as React from "react"
import { Bell, LayoutDashboard, Settings, Star, UsersRound, Lock, Store, LibraryBig } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from 'next/image'
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import SubscriptionModal from "./subscription-modal"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Navigation items
const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Store",
    icon: Store,
    href: "/store",
  },
  {
    title: "Guides Library",
    icon: LibraryBig,
    href: "/guides-library",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

// Premium navigation items
const premiumNavItems = [
  {
    title: "AI-tools",
    icon: Star,
    href: "/ai-tools",
    isPremium: true,
  },
  {
    title: "Community",
    icon: UsersRound,
    href: "/community",
    isPremium: true,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPremium, setIsPremium] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  React.useEffect(() => {
    const checkPremiumStatus = async () => {
      setIsLoading(true);
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();
        
        setIsPremium(profile?.is_premium || false);
      }
      setIsLoading(false);
    };

    checkPremiumStatus();
  }, []);

  const handlePremiumClick = (href: string) => {
    if (!isPremium) {
      toast.custom((t) => (
        <div className="bg-background border rounded-lg p-4 shadow-lg">
          <div className="flex flex-col gap-2">
            <h3 className="text-[#1e4841] font-medium">Premium Required</h3>
            <p className="text-muted-foreground text-sm">
              This feature is only available for premium users. Upgrade your account to access it.
            </p>
            <button
              onClick={() => {
                toast.dismiss(t);
                setShowSubscriptionModal(true);
              }}
              className="mt-2 bg-[#1e4841] text-white px-4 py-2 rounded-md hover:bg-[#1e4841]/90 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      ));
      return;
    }
    router.push(href);
  };

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader className="p-4 pt-8 pb-4">
          <a href="/">
            <span className="sr-only">Home</span>
            <Image
              src="/LogoRemake_DarkGreen.svg"
              width={140}
              height={40}
              alt="StorePartner logo"
              priority
              style={{ height: 'auto' }}
            />
          </a>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size="default"
                      isActive={pathname === item.href}
                      className="data-[active=true]:bg-[#bbf49c] hover:bg-[#bbf49c]/30 active:bg-[#bbf49c] py-5 pl-4 transition-all duration-200 ease-in-out group focus-visible:ring-[#1e4841] focus-visible:ring-offset-0"
                    >
                      <Link href={item.href} prefetch={true} className="flex items-center gap-2">
                        <div className="transition-colors duration-200 ease-in-out">
                          <item.icon className={`size-4.5 ${pathname === item.href ? "text-[#1e4841]" : "text-foreground group-hover:text-[#1e4841]"}`} />
                        </div>
                        <span className="transition-colors duration-200 ease-in-out group-hover:text-[#1e4841]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="p-2">Premium</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {premiumNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size="default"
                      isActive={pathname === item.href}
                      className="data-[active=true]:bg-[#bbf49c] hover:bg-[#bbf49c]/30 active:bg-[#bbf49c] py-5 pl-4 transition-all duration-200 ease-in-out group focus-visible:ring-[#1e4841] focus-visible:ring-offset-0"
                    >
                      <div 
                        onClick={() => handlePremiumClick(item.href)}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="transition-colors duration-200 ease-in-out">
                            <item.icon className={`size-4.5 ${pathname === item.href ? "text-[#1e4841]" : "text-foreground group-hover:text-[#1e4841]"}`} />
                          </div>
                          <span className="transition-colors duration-200 ease-in-out group-hover:text-[#1e4841]">{item.title}</span>
                        </div>
                        {item.isPremium && !isPremium && !isLoading && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
            <Card className="bg-muted/75 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute inset-0 border-2 rounded-lg animate-border-rotate animate-border-glow" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upgrade to Premium</CardTitle>
                <CardDescription className="text-xs">Unlock all features and benefits</CardDescription>
              </CardHeader>
              <CardContent className="pb-2 text-xs">
                <ul className="space-y-1">
                  <li className="flex items-center gap-1">
                    <Star className="size-3 text-amber-500" />
                    <span>Access to AI-tools</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <Star className="size-3 text-amber-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <Star className="size-3 text-amber-500" />
                    <span>Community access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  size="lg" 
                  className="w-full relative z-10 bg-[#1e4841] hover:bg-[#1e4841]/90" 
                  onClick={() => {
                    console.log('Button clicked');
                    setShowSubscriptionModal(true);
                  }}
                >
                  Upgrade Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal} 
      />
    </>
  );
} 