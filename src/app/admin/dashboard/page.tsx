"use client"
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
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import DashboardHeader from "./DashboardHeader"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataTable from "./data-table"
import { columns } from "./columns"
import UserActivityChart from "./user-activity-chart"
import { SubscriptionTiers } from "./subscription-tiers"
import DatePicker, { DateRange } from "@/components/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import CountUp from "react-countup"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)

  // Loading state for metrics
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all store orders client-side (replace with API call or client supabase if needed)
  const [storeOrders, setStoreOrders] = useState<any[]>([])
  useEffect(() => {
    setIsLoading(true)
    fetch('/api/admin/store-orders')
      .then(res => res.json())
      .then(data => setStoreOrders(data.orders || []))
      .finally(() => setIsLoading(false))
  }, [])

  // Fetch users and profiles client-side (replace with API call or client supabase if needed)
  const [users, setUsers] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  useEffect(() => {
    setIsLoading(true)
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setProfiles(data.profiles || [])
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Always show total users and active subscriptions (not filtered by date)
  const totalUsers = users.length;
  const activeSubscriptions = profiles.filter((p: any) => p.is_premium).length;

  // Only filter orders for revenue and sold stores
  const filteredOrders = useMemo(() => {
    if (!selectedRange || !selectedRange.from) return storeOrders;
    const from = new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    const to = selectedRange.to ? new Date(selectedRange.to) : new Date(selectedRange.from);
    to.setHours(23, 59, 59, 999);
    return storeOrders.filter(order => {
      const date = new Date(order.order_date);
      return date >= from && date <= to;
    });
  }, [storeOrders, selectedRange]);

  const filteredRevenue = filteredOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  const filteredSoldStores = filteredOrders.length;

  // Helper: get previous period
  function getPreviousPeriod(selectedRange: DateRange | undefined) {
    if (!selectedRange || !selectedRange.from) return undefined;
    const from = new Date(selectedRange.from);
    const to = selectedRange.to ? new Date(selectedRange.to) : new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Special case: single day
    if (days === 1) {
      // Use the 'to' date if available, otherwise 'from'
      const base = selectedRange.to ? new Date(selectedRange.to) : new Date(selectedRange.from);
      // Construct a new Date in local time at midnight using year, month, day
      const baseLocal = new Date(base.getFullYear(), base.getMonth(), base.getDate());
      // Add one day
      const nextLocal = new Date(baseLocal);
      nextLocal.setDate(baseLocal.getDate() + 1);
      return { from: nextLocal, to: nextLocal };
    }

    // Range case
    const prevTo = new Date(from);
    prevTo.setDate(from.getDate() - 1);
    prevTo.setHours(23, 59, 59, 999);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevTo.getDate() - (days - 1));
    prevFrom.setHours(0, 0, 0, 0);
    return { from: prevFrom, to: prevTo };
  }

  // Filter orders for previous period
  const previousPeriod = getPreviousPeriod(selectedRange);

  const previousOrders = useMemo(() => {
    if (!previousPeriod) return [];
    return storeOrders.filter(order => {
      const date = new Date(order.order_date);
      return date >= previousPeriod.from && date <= previousPeriod.to;
    });
  }, [storeOrders, previousPeriod]);

  const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  const previousSoldStores = previousOrders.length;

  // Calculate trends
  const revenueTrend = previousRevenue === 0 ? (filteredRevenue > 0 ? 100 : 0) : ((filteredRevenue - previousRevenue) / Math.max(previousRevenue, 1)) * 100;
  const soldStoresTrend = previousSoldStores === 0 ? (filteredSoldStores > 0 ? 100 : 0) : ((filteredSoldStores - previousSoldStores) / Math.max(previousSoldStores, 1)) * 100;

  // Helper: format date range for display
  function formatDateRange(from: Date, to: Date) {
    // If the range is a single day, show only that date
    if (from.toDateString() === to.toDateString()) {
      return format(from, 'PPP', { locale: sv })
    }
    return `${format(from, 'PPP', { locale: sv })} - ${format(to, 'PPP', { locale: sv })}`
  }

  // Prepare revenue chart data based on selected range
  let chartData: any[] = [];
  let chartGranularity: 'hour' | 'day' = 'day';
  if (selectedRange && selectedRange.from) {
    const from = new Date(selectedRange.from);
    const to = selectedRange.to ? new Date(selectedRange.to) : new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days === 1) {
      // Group by hour
      chartGranularity = 'hour';
      const hours = Array.from({ length: 24 }, (_, i) => i);
      chartData = hours.map(hour => {
        const revenue = filteredOrders
          .filter(order => {
            const date = new Date(order.order_date);
            return date.getHours() === hour;
          })
          .reduce((sum, order) => sum + (order.price || 0), 0);
        return { hour: hour.toString().padStart(2, '0'), revenue: Number(revenue) || 0 };
      });
    } else {
      // Group by day
      chartGranularity = 'day';
      const dayCount = days;
      chartData = Array.from({ length: dayCount }, (_, i) => {
        const day = new Date(from);
        day.setDate(from.getDate() + i);
        const dayStr = day.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
        const revenue = filteredOrders
          .filter(order => {
            const date = new Date(order.order_date);
            return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
          })
          .reduce((sum, order) => sum + (order.price || 0), 0);
        return { day: dayStr, revenue: Number(revenue) || 0 };
      });
    }
  } else {
    // Default data for the last 7 days when no date range is selected
    chartGranularity = 'day';
    const today = new Date();
    chartData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const dayStr = day.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
      const revenue = filteredOrders
        .filter(order => {
          const date = new Date(order.order_date);
          return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
        })
        .reduce((sum, order) => sum + (order.price || 0), 0);
      return { day: dayStr, revenue: Number(revenue) || 0 };
    });
  }

  console.log('Filtered Orders:', filteredOrders);
  console.log('Chart Data:', chartData);
  console.log('Chart Granularity:', chartGranularity);

  const visitorChartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ]

  const visitorChartConfig = {
    desktop: {
      label: "Desktop",
      color: "rgb(59 130 246)", // blue-500
    },
    mobile: {
      label: "Mobile",
      color: "rgb(16 185 129)", // emerald-500
    },
  } satisfies ChartConfig

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DashboardHeader onRangeChange={setSelectedRange} />
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Card className="relative overflow-hidden border-border">
              <div className="absolute inset-0 bg-secondary/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-lg font-medium">Revenue</CardTitle>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 rounded" />
                  ) : (
                    <CountUp end={filteredRevenue} duration={1} separator=" " decimals={2} decimal="," prefix="kr " />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={`flex items-center ${revenueTrend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {revenueTrend >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />} 
                    {Math.abs(revenueTrend).toFixed(1)}%
                  </span>{" "}
                  jämfört med förra perioden
                  {previousPeriod && (
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {selectedRange && selectedRange.from && (!selectedRange.to || selectedRange.from.toDateString() === selectedRange.to.toDateString())
                        ? `(${format(previousPeriod.to, 'PPP', { locale: sv })})`
                        : `(${formatDateRange(previousPeriod.from, previousPeriod.to)})`}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-border">
              <div className="absolute inset-0 bg-secondary/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-lg font-medium">Sold Stores</CardTitle>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <LineChart className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 rounded" />
                  ) : (
                    <CountUp end={filteredSoldStores} duration={1} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={`flex items-center ${soldStoresTrend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {soldStoresTrend >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />} 
                    {Math.abs(soldStoresTrend).toFixed(1)}%
                  </span>{" "}
                  jämfört med förra perioden
                  {previousPeriod && (
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {selectedRange && selectedRange.from && (!selectedRange.to || selectedRange.from.toDateString() === selectedRange.to.toDateString())
                        ? `(${format(previousPeriod.to, 'PPP', { locale: sv })})`
                        : `(${formatDateRange(previousPeriod.from, previousPeriod.to)})`}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-border">
              <div className="absolute inset-0 bg-secondary/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-lg font-medium">Users & Subscriptions</CardTitle>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-2">
                <div>
                  <span className="block text-xs text-muted-foreground">Total Users</span>
                  <span className="text-xl font-bold">
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 rounded" />
                    ) : (
                      <CountUp end={totalUsers} duration={1} />
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Active Subscriptions</span>
                  <span className="text-xl font-bold">
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 rounded" />
                    ) : (
                      <CountUp end={activeSubscriptions} duration={1} />
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown by subscription tier</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Removed <RevenueChart /> as it's replaced by AreaChart elsewhere */}
              </CardContent>
            </Card>
            <Card className="col-span-3 border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">User Activity</CardTitle>
                <CardDescription>Daily active users over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <UserActivityChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Users</CardTitle>
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
            <Card className="col-span-3 border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Subscription Tiers</CardTitle>
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
          <Card className="col-span-7 border-border">
            <CardHeader>
              <CardTitle>Area Chart - Gradient</CardTitle>
              <CardDescription>
                Showing total visitors for the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] px-0">
              <ChartContainer config={visitorChartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={visitorChartData}
                  height={300}
                  width={undefined}
                  margin={{
                    left: 24,
                    right: 24,
                    top: 8,
                    bottom: 8
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="rgb(59 130 246)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="rgb(59 130 246)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="rgb(16 185 129)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="rgb(16 185 129)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="url(#fillMobile)"
                    fillOpacity={0.4}
                    stroke="rgb(16 185 129)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    fillOpacity={0.4}
                    stroke="rgb(59 130 246)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2024
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}


