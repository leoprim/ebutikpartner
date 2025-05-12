"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, DollarSign, Mail, Package, ShoppingBag, Tag, User } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpdateStoreForm } from "./update-store-form"

interface StoreOrder {
  id: string
  store_name: string
  client_name: string
  client_email: string
  order_date: string
  status: 'pending' | 'in-progress' | 'review' | 'delivered'
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
}

export default function StoreDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [storeDetails, setStoreDetails] = useState<StoreOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStoreDetails()
  }, [params.id])

  const fetchStoreDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('store_orders')
        .select('*')
        .eq('id', params.id)
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
                storeDetails.status === "delivered"
                  ? "bg-green-500 text-white"
                  : storeDetails.status === "review"
                    ? "bg-amber-500 text-white"
                    : undefined
              }
            >
              {storeDetails.status === "in-progress"
                ? "In Progress"
                : storeDetails.status === "review"
                  ? "Ready for Review"
                  : storeDetails.status === "delivered"
                    ? "Delivered"
                    : "Pending"}
            </Badge>
            <Button onClick={handleDeliver} disabled={storeDetails.status === "delivered"}>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Overall Completion</p>
                  <p className="text-sm font-medium">{storeDetails.progress}%</p>
                </div>
                <Progress value={storeDetails.progress} className="h-2" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Estimated Delivery</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {storeDetails.status === 'delivered'
                      ? 'Delivered'
                      : new Date(storeDetails.order_date).toLocaleDateString()}
                  </p>
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
