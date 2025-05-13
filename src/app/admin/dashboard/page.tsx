"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  LineChart,
  Menu,
  Package,
  Search,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataTable from "./data-table"
import { columns } from "./columns"
import RevenueChart from "./revenue-chart"
import UserActivityChart from "./user-activity-chart"
import { SubscriptionTiers } from "./subscription-tiers"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              May 2025
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-lg font-medium">Total Users</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">12,548</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      12.5%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-lg font-medium">Revenue</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      8.2%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-lg font-medium">Active Subscriptions</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">9,842</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      4.3%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/50" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-lg font-medium">Sold Stores</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <LineChart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">363</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-rose-500 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      0.5%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue breakdown by subscription tier</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <RevenueChart/>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Daily active users over the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserActivityChart />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Recently registered users on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={[
                      {
                        id: "728ed52f",
                        name: "Jane Smith",
                        email: "jane@example.com",
                        status: "active" as const,
                        plan: "Professional" as const,
                        joined: "May 2, 2025",
                      },
                      {
                        id: "489e1d42",
                        name: "John Doe",
                        email: "john@example.com",
                        status: "active" as const,
                        plan: "Basic" as const,
                        joined: "May 3, 2025",
                      },
                      {
                        id: "573f1d91",
                        name: "Emily Johnson",
                        email: "emily@example.com",
                        status: "active" as const,
                        plan: "Enterprise" as const,
                        joined: "May 4, 2025",
                      },
                      {
                        id: "629f1a82",
                        name: "Michael Brown",
                        email: "michael@example.com",
                        status: "inactive" as const,
                        plan: "Basic" as const,
                        joined: "May 5, 2025",
                      },
                      {
                        id: "182e5d23",
                        name: "Sarah Wilson",
                        email: "sarah@example.com",
                        status: "active" as const,
                        plan: "Professional" as const,
                        joined: "May 6, 2025",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Subscription Tiers</CardTitle>
                  <CardDescription>Distribution of users across subscription plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionTiers/>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View detailed breakdown
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
