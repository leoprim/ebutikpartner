"use client"

import { useState, useEffect } from "react"
import { Edit, ExternalLink, MoreHorizontal, Package, Trash } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface StoreOrder {
  id: string
  store_name: string
  client_name: string
  client_email: string
  order_date: string
  status: 'pending' | 'in-progress' | 'review' | 'delivered'
  price: number
  niche: string
  progress: number
}

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "in-progress":
      return <Badge variant="secondary">In Progress</Badge>
    case "review":
      return (
        <Badge variant="default" className="bg-amber-500">
          Ready for Review
        </Badge>
      )
    case "delivered":
      return (
        <Badge variant="default" className="bg-green-500">
          Delivered
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function StoreOrdersTable() {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState<StoreOrder | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const supabase = createClientComponentClient()

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from database...')
      
      // Since we're in an admin route, we can assume we're authenticated
      // Try a more explicit query with error details
      const { data, error } = await supabase
        .from('store_orders')
        .select(`
          id,
          store_name,
          client_name,
          client_email,
          order_date,
          status,
          price,
          niche,
          progress,
          user_id
        `)
        .order('order_date', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Raw query response:', { data, error })
      console.log('Number of orders found:', data?.length || 0)
      
      if (data) {
        console.log('First order (if any):', data[0])
      }

      setOrders(data || [])
    } catch (error) {
      console.error('Error in fetchOrders:', error)
      toast.error('Failed to load store orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        console.log('Initializing component...')
        // Since we're in an admin route, we can assume we're authenticated
        if (mounted) {
          await fetchOrders()
        }
      } catch (error) {
        console.error('Error initializing:', error)
        if (mounted) {
          setIsLoading(false)
          toast.error('Failed to initialize')
        }
      }
    }

    // Initialize
    initialize()

    // Cleanup
    return () => {
      console.log('Cleaning up component...')
      mounted = false
    }
  }, [])

  const handleEdit = (order: StoreOrder) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleDeliver = async (order: StoreOrder) => {
    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ status: 'delivered', progress: 100 })
        .eq('id', order.id)

      if (error) throw error

      toast.success('Store marked as delivered')
      fetchOrders()
    } catch (error) {
      console.error('Error delivering store:', error)
      toast.error('Failed to update store status')
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const { error } = await supabase
        .from('store_orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      toast.success('Order deleted successfully')
      fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
    }
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    try {
      const { error } = await supabase
        .from('store_orders')
        .update({
          store_name: editingOrder.store_name,
          client_name: editingOrder.client_name,
          client_email: editingOrder.client_email,
          status: editingOrder.status,
          price: editingOrder.price,
          niche: editingOrder.niche,
          progress: editingOrder.progress,
        })
        .eq('id', editingOrder.id)

      if (error) throw error

      toast.success('Order updated successfully')
      setIsEditDialogOpen(false)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.store_name}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.client_name}</div>
                  <div className="text-sm text-muted-foreground">{order.client_email}</div>
                </div>
              </TableCell>
              <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>${order.price.toFixed(2)}</TableCell>
              <TableCell>{order.progress}%</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(order)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/stores/${order.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeliver(order)} disabled={order.status === "delivered"}>
                      <Package className="mr-2 h-4 w-4" />
                      {order.status === "delivered" ? "Already Delivered" : "Deliver Store"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store Order</DialogTitle>
            <DialogDescription>
              Update the details of this store order.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateOrder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                value={editingOrder?.store_name || ''}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, store_name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={editingOrder?.client_name || ''}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, client_name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={editingOrder?.client_email || ''}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, client_email: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editingOrder?.status || 'pending'}
                onValueChange={(value) => setEditingOrder(prev => prev ? { ...prev, status: value as StoreOrder['status'] } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Ready for Review</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editingOrder?.price || 0}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                value={editingOrder?.niche || ''}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, niche: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={editingOrder?.progress || 0}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, progress: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
