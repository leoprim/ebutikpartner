"use client"

import type * as React from "react"
import { Bell, Home, LayoutDashboard, Settings, Star, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <a href="/">
          <span className="sr-only">Home</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="24" fill="none" viewBox="0 0 176 40"><path fill="#283841" fillRule="evenodd" d="M15 28a5 5 0 0 1-5-5V0H0v23c0 8.284 6.716 15 15 15h11V28H15ZM45 10a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-19 9C26 8.507 34.507 0 45 0s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM153 10a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm-19 9c0-10.493 8.507-19 19-19s19 8.507 19 19-8.507 19-19 19-19-8.507-19-19ZM85 0C74.507 0 66 8.507 66 19s8.507 19 19 19h28c1.969 0 3.868-.3 5.654-.856L124 40l5.768-10.804A19.007 19.007 0 0 0 132 20.261V19c0-10.493-8.507-19-19-19H85Zm37 19a9 9 0 0 0-9-9H85a9 9 0 1 0 0 18h28a9 9 0 0 0 9-8.93V19Z" clipRule="evenodd"></path><path fill="#283841" d="M176 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path></svg>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={pathname === "/dashboard"}
                  className="group hover:bg-[oklch(0.65_0.222_41.116/4.45%)] data-[active=true]:bg-[oklch(0.65_0.222_41.116/9.45%)] px-4 py-2"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4 data-[active=true]:text-[oklch(0.646_0.222_41.116)]" fill="currentColor" />
                    <span className="data-[active=true]:text-[oklch(0.646_0.222_41.116)]">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={pathname === "/home"}
                  className="group hover:bg-[oklch(0.65_0.222_41.116/4.45%)] px-4 py-2"
                >
                  <Link href="/home">
                    <Home className="size-4" />
                    <span>Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={pathname === "/guides-library"}
                  className="group hover:bg-[oklch(0.65_0.222_41.116/4.45%)] px-4 py-2"
                >
                  <Link href="/guides-library">
                    <Users className="size-4" />
                    <span>Guides Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={pathname === "/notifications"}
                  className="group hover:bg-[oklch(0.65_0.222_41.116/4.45%)] px-4 py-2"
                >
                  <Link href="/notifications">
                    <Bell className="size-4" />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={pathname === "/settings"}
                  className="group hover:bg-[oklch(0.65_0.222_41.116/4.45%)] px-4 py-2"
                >
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Premium</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={pathname === "/premium"}
                  className="group hover:bg-[oklch(0.65_0.222_41.116/4.45%)] px-4 py-2"
                >
                  <Link href="/premium">
                    <Star className="size-4" />
                    <span>Premium</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upgrade to Premium</CardTitle>
              <CardDescription className="text-xs">Unlock all features and benefits</CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-xs">
              <ul className="space-y-1">
                <li className="flex items-center gap-1">
                  <Star className="size-3 text-amber-500" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-1">
                  <Star className="size-3 text-amber-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-1">
                  <Star className="size-3 text-amber-500" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full">
                Upgrade Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
} 