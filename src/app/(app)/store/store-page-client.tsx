"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock, AlertCircle, CheckCircle2, Settings, Palette, Package, Truck } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface StoreOrder {
  id: string
  store_name: string
  status: 'pending' | 'in-progress' | 'review' | 'delivered'
  progress: number
  order_date: string
  description: string
  requirements: string[]
  estimated_completion?: string
  last_updated?: string
  current_step?: 'setup' | 'design' | 'content' | 'deliver'
}

const STEPS = [
  { id: 'setup', label: 'Setup', icon: Settings, value: 0 },
  { id: 'design', label: 'Store Design', icon: Palette, value: 33 },
  { id: 'content', label: 'Product & Content', icon: Package, value: 66 },
  { id: 'deliver', label: 'Deliver', icon: Truck, value: 100 }
] as const

export default function StorePageClient() {
  const [storeOrder, setStoreOrder] = useState<StoreOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data, error } = await supabase
            .from('store_orders')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (error) {
            console.error('Error fetching store order:', error)
            return
          }

          setStoreOrder(data)
          setProgress(data.progress)
        }
      } catch (error) {
        console.error('Error in fetchData:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    if (user?.id) {
      const channel = supabase
        .channel(`store_order_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'store_orders',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update received:', payload)
            const newData = payload.new as StoreOrder
            setStoreOrder(newData)
            setProgress(newData.progress)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user?.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'review':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Clock className="w-4 h-4" />
      case 'review':
        return <AlertCircle className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <CalendarDays className="w-4 h-4" />
    }
  }

  const getCurrentStepIndex = (currentStep?: string) => {
    return STEPS.findIndex(step => step.id === currentStep)
  }

  const getCurrentStep = (progress: number) => {
    if (progress >= 100) return STEPS[3]
    if (progress >= 66) return STEPS[2]
    if (progress >= 33) return STEPS[1]
    return STEPS[0]
  }

  return (
    <div className="w-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Store Setup Progress</CardTitle>
                <CardDescription className="text-sm font-normal">Track your store setup progress</CardDescription>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Badge className={storeOrder?.status === "in-progress" ? "bg-blue-100 text-blue-800" : 
                                storeOrder?.status === "review" ? "bg-yellow-100 text-yellow-800" :
                                storeOrder?.status === "delivered" ? "bg-green-100 text-green-800" :
                                "bg-gray-100 text-gray-800"}>
                  {storeOrder?.status || 'pending'}
                </Badge>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div 
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-between">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isActive = step.value <= progress
                  const isCurrentStep = step.value === progress
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-muted-foreground'} group`}
                    >
                      <div className="relative">
                        <div 
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-1 border-primary/10 ${
                            isActive 
                              ? 'border-primary text-primary-foreground' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div
                            className={`absolute inset-0 rounded-full overflow-hidden ${
                              isActive ? 'bg-primary' : 'bg-transparent'
                            }`}
                            style={{
                              transition: 'background-color 0.8s ease-in-out'
                            }}
                          />
                          <Icon className="h-4 w-4 relative z-10" />
                        </div>
                        {isCurrentStep && (
                          <div 
                            className="absolute inset-0 rounded-full ring-3 ring-primary/20 animate-pulse"
                          />
                        )}
                      </div>
                      <span className="mt-2 text-xs font-medium">
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-4 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <motion.div
                className="relative h-2 bg-primary/20 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
              <div className="flex justify-between items-center">
                <motion.span
                  key={progress}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  Current Step: {getCurrentStep(progress).label}
                </motion.span>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>Ordered: {storeOrder?.order_date ? new Date(storeOrder.order_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Est. Delivery: {storeOrder?.estimated_completion ? new Date(storeOrder.estimated_completion).toLocaleDateString() : 'TBD'}</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 