"use client"

import * as React from "react"
import { LayoutDashboard, Users, Settings, Store, LibraryBig, Bell, Shield, Package } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from 'next/image'
import { useTransition } from "react"
import { cn } from "@/lib/utils"

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

// Admin navigation items
const adminNavItems = [
  {
    title: "Instrumentpanel",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Användare",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Butiker",
    icon: Store,
    href: "/admin/stores",
  },
  {
    title: "Produkter",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Videobibliotek",
    icon: LibraryBig,
    href: "/admin/videos",
  },
  {
    title: "Admin Community",
    icon: Bell,
    href: "/admin/community",
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Sidebar {...props} className="[&>div]:bg-primary [&>div]:text-white [&>div>div]:bg-primary [&>div]:group-hover:text-white/70">
      <SidebarHeader className="p-7 pt-8 pb-4">
        <button onClick={() => handleNavigation("/admin")} className="transition-opacity">
          <span className="sr-only">Admin Dashboard</span>
          <Image
            src="/LogoNewRemake_White.svg"
            width={140}
            height={40}
            alt="StorePartner Admin"
            priority
            style={{ height: 'auto' }}
          />
        </button>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="default"
                    isActive={pathname === item.href}
                    className={cn(
                      "data-[active=true]:bg-white/20 hover:bg-white/10 active:bg-white/20 py-5 pl-4 transition-all duration-200 ease-in-out",
                      isPending && "opacity-50 pointer-events-none"
                    )}
                  >
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center gap-2 w-full group"
                    >
                      <div className={cn(
                        pathname === item.href ? "text-white" : "text-white group-hover:text-white transition-colors duration-200",
                      )}>
                        <item.icon className="size-4.5" />
                      </div>
                      <span className="text-white group-hover:text-white transition-colors duration-200 font-medium">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
} 