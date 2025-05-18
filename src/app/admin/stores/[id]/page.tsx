"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, DollarSign, Mail, Package, ShoppingBag, Tag, User, Settings, Palette, Truck } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpdateStoreForm } from "./update-store-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"

const STEPS = [
  { id: 'setup', label: 'Setup', icon: Settings, value: 0 },
  { id: 'design', label: 'Store Design', icon: Palette, value: 33 },
  { id: 'content', label: 'Product & Content', icon: Package, value: 66 },
  { id: 'deliver', label: 'Deliver', icon: Truck, value: 100 }
] as const

interface StoreOrder {
  id: string
  store_name: string
  client_name: string
  client_email: string
  order_date: string
  status: 'Väntar' | 'Under utveckling' | 'Granska' | 'Levererad'
  price: number
  niche: string
  description: string
  requirements: string[]
  progress: number
  timeline: {
    date: string
    event: string
    completed: boolean
  }[]
  current_step?: 'setup' | 'design' | 'content' | 'deliver'
}

export default function StoreDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [storeDetails, setStoreDetails] = useState<StoreOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [storeId, setStoreId] = useState<string | null>(null)

  useEffect(() => {
    if (params?.id) {
      setStoreId(params.id)
    }
  }, [params])

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails()
    }
  }, [storeId])

  const fetchStoreDetails = async () => {
    if (!storeId) return

    try {
      const { data, error } = await supabase
        .from('store_orders')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) throw error

      // Create a timeline based on the order's progress
      const timeline = [
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Order received', completed: true },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Initial setup', completed: data.progress >= 25 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Theme customization', completed: data.progress >= 50 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Product setup', completed: data.progress >= 75 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Final review', completed: data.progress >= 90 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Store delivery', completed: data.status === 'delivered' },
      ]

      setStoreDetails({ ...data, timeline })
      setProgress(data.progress)
    } catch (error) {
      console.error('Error fetching store details:', error)
      toast.error('Failed to load store details')
      router.push('/admin/stores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeliver = async () => {
    if (!storeDetails) return

    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ status: 'delivered', progress: 100 })
        .eq('id', storeDetails.id)

      if (error) throw error

      toast.success('Store marked as delivered')
      fetchStoreDetails()
    } catch (error) {
      console.error('Error delivering store:', error)
      toast.error('Failed to update store status')
    }
  }

  const getCurrentStep = (progress: number) => {
    return STEPS.find(step => step.value >= progress) || STEPS[0]
  }

  const handleProgressChange = async (value: number[]) => {
    if (!storeId) return

    const newProgress = value[0]
    const currentStep = getCurrentStep(newProgress)
    
    try {
      const { data, error } = await supabase
        .from('store_orders')
        .update({
          progress: currentStep.value,
          status: currentStep.id === 'deliver' ? 'Levererad' : 'Under utveckling',
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId)

      if (error) {
        console.error('Error updating progress:', error)
        toast.error('Failed to update progress')
        return
      }

      // Fetch the updated record
      const { data: updatedData, error: fetchError } = await supabase
        .from('store_orders')
        .select('*')
        .eq('id', storeId)
        .single()

      if (fetchError) {
        console.error('Error fetching updated data:', fetchError)
        return
      }

      toast.success('Progress updated successfully')
      setProgress(currentStep.value)
      setStoreDetails(prev => prev ? {
        ...prev,
        progress: currentStep.value,
        status: currentStep.id === 'deliver' ? 'Levererad' : 'Under utveckling'
      } : null)
    } catch (error) {
      console.error('Error in handleProgressChange:', error)
      toast.error('Failed to update progress')
    }
  }

  const handleNextStep = () => {
    const currentStepIndex = STEPS.findIndex(step => step.value === progress)
    if (currentStepIndex < STEPS.length - 1) {
      handleProgressChange([STEPS[currentStepIndex + 1].value])
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!storeDetails) {
    return <div>Store not found</div>
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/stores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to stores</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{storeDetails.store_name}</h1>
            <p className="text-muted-foreground">Order ID: {storeDetails.id}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant="secondary"
              className={
                storeDetails.status === "Levererad"
                  ? "bg-green-500 text-white"
                  : storeDetails.status === "Granska"
                    ? "bg-amber-500 text-white"
                    : undefined
              }
            >
              {storeDetails.status === "Under utveckling"
                ? "In Progress"
                : storeDetails.status === "Granska"
                  ? "Ready for Review"
                  : storeDetails.status === "Levererad"
                    ? "Delivered"
                    : "Pending"}
            </Badge>
            <Button onClick={handleDeliver} disabled={storeDetails.status === "Levererad"}>
              Deliver Store
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{storeDetails.client_name}</p>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{storeDetails.client_email}</p>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{new Date(storeDetails.order_date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Store Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{storeDetails.store_name}</p>
                  <p className="text-sm text-muted-foreground">Store Name</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{storeDetails.niche}</p>
                  <p className="text-sm text-muted-foreground">Niche/Category</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">${storeDetails.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Package Price</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-between">
                  {STEPS.map((step) => {
                    const Icon = step.icon
                    const isActive = step.value <= progress
                    return (
                      <div
                        key={step.id}
                        className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-gray-200'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="mt-2 text-xs font-medium">{step.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={33}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Current Step: {getCurrentStep(progress).label}
                  </span>
                  <Button
                    onClick={handleNextStep}
                    disabled={progress >= 100}
                  >
                    Next Step
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Ordered: {new Date(storeDetails.order_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge className={storeDetails.status === "Under utveckling" ? "bg-blue-100 text-blue-800" : 
                                  storeDetails.status === "Granska" ? "bg-yellow-100 text-yellow-800" :
                                  storeDetails.status === "Levererad" ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"}>
                    {storeDetails.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="update">Update Status</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Description</CardTitle>
                <CardDescription>Details about the store and its requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{storeDetails.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Requirements</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {storeDetails.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Track the progress of this store order</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l border-muted">
                  {storeDetails.timeline.map((item, index) => (
                    <li key={index} className="mb-6 ml-6">
                      <span
                        className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${
                          item.completed
                            ? "bg-green-500 ring-4 ring-green-100 dark:ring-green-900"
                            : "bg-muted-foreground/30 ring-4 ring-muted"
                        }`}
                      >
                        {item.completed && <Package className="h-3 w-3 text-white" />}
                      </span>
                      <h3 className="font-medium">{item.event}</h3>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Store Status</CardTitle>
                <CardDescription>Change the status and progress of this store order</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateStoreForm 
                  storeId={storeDetails.id} 
                  currentStatus={storeDetails.status} 
                  currentProgress={storeDetails.progress}
                  onUpdate={fetchStoreDetails} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
