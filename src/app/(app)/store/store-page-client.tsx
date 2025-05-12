"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

interface StoreOrder {
  id: string
  store_name: string
  status: 'pending' | 'in-progress' | 'review' | 'delivered'
  progress: number
  order_date: string
  description: string
  requirements: string[]
}

interface DebugInfo {
  userId: string
  isAdmin: boolean | null
  adminError: unknown
  storeOrderData: unknown
  storeOrderError: unknown
  timestamp: string
  catchError?: unknown
}

interface StorePageClientProps {
  user: User
}

export default function StorePageClient({ user }: StorePageClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [storeOrder, setStoreOrder] = useState<StoreOrder | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    let mounted = true

    const fetchOrder = async (userId: string) => {
      if (!mounted) return

      try {
        console.log('Fetching order for user:', userId)

        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: userId })
        
        console.log('Admin check:', { isAdmin, adminError })

        // Now fetch the store order with more detailed logging
        console.log('Querying store_orders table for user_id:', userId)
        const { data, error } = await supabase
          .from('store_orders')
          .select('*')
          .eq('user_id', userId)
          .single()

        console.log('Store order query result:', { 
          data, 
          error,
          queryDetails: {
            table: 'store_orders',
            user_id: userId,
            error_code: error?.code,
            error_message: error?.message,
            error_details: error?.details
          }
        })
        
        if (!mounted) return

        // Store debug info
        setDebugInfo({
          userId,
          isAdmin,
          adminError,
          storeOrderData: data,
          storeOrderError: error,
          timestamp: new Date().toISOString()
        })

        if (error) {
          console.error('Error fetching order:', error)
          setStoreOrder(null)
          return
        }

        setStoreOrder(data)
      } catch (error) {
        console.error('Error:', error)
        if (!mounted) return
        setDebugInfo(prev => prev ? {
          ...prev,
          catchError: error,
          timestamp: new Date().toISOString()
        } : null)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchOrder(user.id)

    // Cleanup
    return () => {
      mounted = false
    }
  }, [user.id, supabase])

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
        </div>
      </div>
    )
  }

  if (!storeOrder) {
    return (
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Store Order Found</CardTitle>
            <CardDescription>
              You haven&apos;t placed any store orders yet. If you&apos;ve already placed an order, please make sure you&apos;re signed in with the correct account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe you should see your store order here, please check that:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
              <li>You&apos;re signed in with the email address you used to place the order</li>
              <li>Your order was successfully placed and confirmed</li>
              <li>You haven&apos;t accidentally signed in with a different account</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              If you need assistance, please contact our support team.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
            {debugInfo && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium mb-2">Debug Information:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
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
            Your store &quot;{storeOrder.store_name}&quot; is {storeOrder.progress}% complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-2 space-y-2">
            <Progress value={storeOrder.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 