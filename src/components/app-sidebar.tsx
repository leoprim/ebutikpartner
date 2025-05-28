"use client"

import * as React from "react"
import { Bell, LayoutDashboard, PackageSearch, Star, UsersRound, Lock, Store, LibraryBig, Crown, Rocket} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from 'next/image'
import toast from "react-hot-toast"
import { createBrowserClient } from "@supabase/ssr"
import SubscriptionModal from "./subscription-modal"
import { useNiche } from "@/contexts/niche-context"


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
//import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {Button, ButtonGroup} from "@heroui/button";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPremium, setIsPremium] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const { needsNicheSelection } = useNiche();

  // Add console log to debug
  React.useEffect(() => {
    console.log('Needs niche selection:', needsNicheSelection);
  }, [needsNicheSelection]);

  // Navigation items
  const navItems = [
    {
      title: "Instrumentpanel",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Butik",
      icon: Store,
      href: "/store",
      showNotification: needsNicheSelection,
    },
    {
      title: "Guider",
      icon: LibraryBig,
      href: "/guides-library",
    },
  ]

  // Premium navigation items
  const premiumNavItems = [
    {
      title: "AI-verktyg",
      icon: Star,
      href: "/ai-tools",
      isPremium: true,
    },
    {
      title: "Gemenskap",
      icon: UsersRound,
      href: "/community",
      isPremium: true,
    },
    {
      title: "Produktbibliotek",
      icon: PackageSearch,
      href: "/product-library",
      isPremium: true,
    },
  ]

  React.useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
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
          
          if (profile?.is_premium) {
            setIsPremium(true);
          }
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    };

    checkPremiumStatus();
  }, []);

  const handlePremiumClick = (href: string) => {
    if (!isPremium) {
      toast.error(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>Premium krävs - Uppgradera ditt konto för att få tillgång till denna funktion</span>
            <button
              onClick={() => {
                setShowSubscriptionModal(true);
                toast.dismiss(t.id);
              }}
              className="bg-[#1e4841] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1e4841]/90 transition-colors"
            >
              Uppgradera nu
            </button>
          </div>
        ),
        {
          duration: 5000,
        }
      );
      return;
    }
    router.push(href);
  };

  return (
    <>
      <Sidebar {...props} className="[&>div]:group-hover:text-foreground">
        <SidebarHeader className="p-4 pt-8 pb-4 pl-5">
          <a href="/">
            <span className="sr-only">Hem</span>
            <Image
              src="/LogoNewRemake_DarkGreen.svg"
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
                      className="data-[active=true]:bg-[#bbf49c] hover:bg-[#bbf49c]/30 active:bg-[#bbf49c] py-5 pl-4 transition-all duration-200 ease-in-out focus-visible:ring-[#1e4841] focus-visible:ring-offset-0 font-medium"
                    >
                      <Link href={item.href} prefetch={true} className="flex items-center gap-2 font-medium w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div>
                            <item.icon className={`size-4.5 ${pathname === item.href ? "text-[#1e4841]" : "text-foreground"}`} />
                          </div>
                          <span className={`font-medium ${pathname === item.href ? "text-[#1e4841]" : "text-foreground"}`}>{item.title}</span>
                        </div>
                        {item.showNotification && (
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
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
                      className="data-[active=true]:bg-[#bbf49c] hover:bg-[#bbf49c]/30 active:bg-[#bbf49c] py-5 pl-4 transition-all duration-200 ease-in-out focus-visible:ring-[#1e4841] focus-visible:ring-offset-0"
                    >
                      <div 
                        onClick={() => handlePremiumClick(item.href)}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div>
                            <item.icon className={`size-4.5 ${pathname === item.href ? "text-[#1e4841]" : "text-foreground"}`} />
                          </div>
                          <span className={`font-medium ${pathname === item.href ? "text-[#1e4841]" : "text-foreground"}`}>{item.title}</span>
                        </div>
                        {item.isPremium && !isPremium && (
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
            {!isPremium && (
              <Card className="bg-[url(/3149495.jpg)] bg-cover bg-center relative overflow-hidden group border-none shadow-none flex flex-col mt-4 pb-0 animate-in fade-in duration-300">
                <div className="absolute inset-0 opacity-0 transition-all duration-300">
                  <div className="absolute inset-0 rounded-lg" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[15px] font-medium">Uppgradera till Premium</CardTitle>
                  <CardDescription className="text-xs font-normal text-primary/70">Lås upp alla funktioner och fördelar</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 text-xs">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-1">
                      <Crown className="size-3 text-primary" />
                      <span>Tillgång till AI-verktyg</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Crown className="size-3 text-primary" />
                      <span>Prioriterad support</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Crown className="size-3 text-primary" />
                      <span>Tillgång till gemenskap</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="relative flex items-center justify-center p-4 m-0 mt-auto">
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
                  <Button 
                    color="primary"
                    size="lg" 
                    radius="md"
                    className="w-full relative z-10 bg-[#1e4841] hover:bg-[#1e4841]/90 rounded-lg font-medium duration-300" 
                    onClick={() => {
                      console.log('Button clicked');
                      setShowSubscriptionModal(true);
                    }}
                  >
                    Uppgradera nu
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SubscriptionModal 
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />
    </>
  )
} 