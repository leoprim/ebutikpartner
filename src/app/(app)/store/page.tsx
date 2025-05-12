"use client"

import { useState, useEffect } from "react"
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

export default function StorePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [storeOrder, setStoreOrder] = useState<StoreOrder | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStoreOrder = async () => {
      try {
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

        console.log('Fetch store order - Data:', data)
        setStoreOrder(data)
      } catch (error) {
        console.error('Error fetching store order:', error)
        toast.error('Failed to load store information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreOrder()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
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
