"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, Package, ShoppingBag, Store, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivity } from "../dashboard/recent-activity"
import { StoreSetupTasks } from "./store-setup-tasks"
import { Skeleton } from "@/components/ui/skeleton"

interface StoreOrder {
  id: string
  store_name: string
  status: 'pending' | 'in-progress' | 'review' | 'delivered'
  progress: number
  order_date: string
  description: string
  requirements: string[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

// Cache key for store order
const STORE_ORDER_CACHE_KEY = 'store_order_cache'

export default function StorePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [storeOrder, setStoreOrder] = useState<StoreOrder | null>(null)
  const supabase = createClientComponentClient()

  const fetchStoreOrder = useCallback(async () => {
    try {
      // Check cache first
      const cachedData = sessionStorage.getItem(STORE_ORDER_CACHE_KEY)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        // Cache is valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setStoreOrder(data)
          setIsLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('store_orders')
        .select('*')
        .order('order_date', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Fetch store order - Error:', error)
        throw error
      }

      // Update cache
      sessionStorage.setItem(STORE_ORDER_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))

      setStoreOrder(data)
    } catch (error) {
      console.error('Error fetching store order:', error)
      toast.error('Failed to load store information')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStoreOrder()

    // Set up real-time subscription for store order updates
    const channel = supabase
      .channel('store_order_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_orders'
        },
        (payload) => {
          // Refresh data when changes occur
          fetchStoreOrder()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStoreOrder, supabase])

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="mt-2 h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!storeOrder) {
    return (
      <div className="flex-1 p-6">
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>No Store Order Found</CardTitle>
                <CardDescription>You haven't placed any store orders yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/pricing">View Pricing</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Store Progress</CardTitle>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {storeOrder.status === "in-progress"
                    ? "In Progress"
                    : storeOrder.status === "review"
                      ? "Ready for Review"
                      : storeOrder.status === "delivered"
                        ? "Delivered"
                        : "Pending"}
                </Badge>
              </div>
              <CardDescription className="text-sm font-normal">
                Your store "{storeOrder.store_name}" is {storeOrder.progress}% complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <Progress value={storeOrder.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    <span>Store setup</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    <span>Products added</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-amber-500" />
                    <span>Theme customization</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-amber-500" />
                    <span>Payment setup</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Details about your store and its requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tasks" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="tasks">Setup Tasks</TabsTrigger>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                  <StoreSetupTasks requirements={storeOrder.requirements} />
                </TabsContent>
                <TabsContent value="activity" className="space-y-4">
                  <RecentActivity />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
