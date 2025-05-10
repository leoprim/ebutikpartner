"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="w-full p-6">
      <p className="mt-2 text-muted-foreground">
        Welcome back! Here's an overview of your store.
      </p>
      <Separator className="my-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <div className="text-2xl font-bold">$45,231.89</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-muted-foreground">Subscriptions</h3>
            <div className="text-2xl font-bold">+2350</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-muted-foreground">Sales</h3>
            <div className="text-2xl font-bold">+12,234</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
            <div className="text-2xl font-bold">+573</div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-medium">Dashboard Content</h3>
        <Separator className="my-4" />
        <p className="text-muted-foreground">
          This is the main content area of your dashboard. Add your charts, tables, and other components here.
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 