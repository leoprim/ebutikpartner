"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock, AlertCircle, CheckCircle2, Settings, Palette, Package, Truck, ShoppingBag } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface StoreOrder {
  id: string
  store_name: string
  status: 'Väntar' | 'Under utveckling' | 'Granska' | 'Levererad'
  progress: number
  order_date: string
  description: string
  requirements: string[]
  estimated_completion?: string
  last_updated?: string
  current_step?: 'setup' | 'design' | 'content' | 'deliver'
}

const STEPS = [
  { id: 'setup', label: 'Uppsättning', icon: Settings, value: 0 },
  { id: 'design', label: 'Butiksdesign', icon: Palette, value: 33 },
  { id: 'content', label: 'Produkt & innehåll', icon: Package, value: 66 },
  { id: 'deliver', label: 'Leverans', icon: Truck, value: 100 }
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
      case 'Under utveckling':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'Granska':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'Levererad':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Under utveckling':
        return <Clock className="w-4 h-4" />
      case 'Granska':
        return <AlertCircle className="w-4 h-4" />
      case 'Levererad':
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
      <AnimatePresence>
        {!isLoading && storeOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="w-full overflow-hidden">
              <CardHeader className="relative">
                <div className="absolute inset-0" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-medium">Status för din butik</CardTitle>
                    <CardDescription className="text-sm font-normal mt-1">Följ resan av utvecklingen av din butik nedan. Vid frågor, skriv i chatten.</CardDescription>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Badge className={`px-3 py-1.5 text-sm font-medium ${
                      storeOrder?.status === "Under utveckling" ? "bg-blue-100 text-blue-800" : 
                      storeOrder?.status === "Granska" ? "bg-yellow-100 text-yellow-800" :
                      storeOrder?.status === "Levererad" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      <span className="flex items-center gap-1.5">
                        {getStatusIcon(storeOrder?.status || 'pending')}
                        {storeOrder?.status || 'pending'}
                      </span>
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
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
                        <motion.div
                          key={step.id}
                          className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-muted-foreground'} group`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative">
                            <div 
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
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
                              <Icon className="h-5 w-5 relative z-10" />
                            </div>
                            {isCurrentStep && (
                              <motion.div 
                                className="absolute inset-0 rounded-full ring-4 ring-primary/20"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            )}
                          </div>
                          <span className="mt-2 text-xs font-medium">
                            {step.label}
                          </span>
                          {isCurrentStep && (
                            <motion.span
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-primary mt-1"
                            >
                              Under utveckling
                            </motion.span>
                          )}
                        </motion.div>
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
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Förlopp</span>
                    <span className="text-sm font-medium text-primary">{progress}%</span>
                  </div>
                  <motion.div
                    className="relative h-3 bg-primary/10 rounded-full overflow-hidden"
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
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <div>
                      <span className="block text-xs font-medium text-muted-foreground">Orderdatum</span>
                      <span className="font-medium">{storeOrder?.order_date ? new Date(storeOrder.order_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <div className="text-right">
                      <span className="block text-xs font-medium text-muted-foreground">Förväntad leverans</span>
                      <span className="font-medium">{storeOrder?.estimated_completion ? new Date(storeOrder.estimated_completion).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="w-full overflow-hidden">
              <CardHeader className="relative">
                <div className="relative flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-medium">Kom igång med EbutikPartner</CardTitle>
                    <CardDescription className="text-sm font-normal mt-1">
                    Köp en skräddarsydd Shopify-butik från vårt team och starta din resa..
                    </CardDescription>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Badge className="px-3 py-1.5 text-sm font-medium bg-secondary text-primary">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" />
                        Begränsat erbjudande
                      </span>
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Skräddarsytt tema</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Våra skräddarsydda butiker levereras med ett anpassat tema som vi har byggt.</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Produkt & Leverantör</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Vi lägger till en produkt och leverantör i din butik baserat på vald nisch.</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Videoguider</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Stärk din verksamhet med våra djupgående videoguider.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 mt-4 border border-muted rounded-lg">
                    <span className="text-3xl font-medium">9995:-</span>
                    <span className="text-sm text-muted-foreground mt-1">Engångskostnad</span>
                    
                    <div className="w-full max-w-md mt-6">
                      <Button className="w-full text-white" size="lg">
                        Köp min butik idag
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>Har du några frågor? Kontakta vårt supportteam för att få hjälp.</p>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 