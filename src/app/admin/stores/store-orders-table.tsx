"use client"

import { useState, useEffect } from "react"
import { Edit, ExternalLink, MoreHorizontal, Package, Trash } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

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
import { Skeleton } from "@/components/ui/skeleton"

interface StoreOrder {
  id: string
  store_name: string
  client_name: string
  client_email: string
  order_date: string
  status: 'Väntar' | 'Under utveckling' | 'Granska' | 'Levererad'
  price: number
  niche: string
  progress: number
  user_id: string
}

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "Väntar":
      return <Badge variant="outline">Väntar</Badge>
    case "Under utveckling":
      return <Badge variant="secondary">Under utveckling</Badge>
    case "Granska":
      return (
        <Badge variant="default" className="bg-amber-500">
          Redo för granskning
        </Badge>
      )
    case "Levererad":
      return (
        <Badge variant="default" className="bg-green-500">
          Levererad
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

type StoreOrdersTableProps = {
  initialOrders: StoreOrder[]
}

export default function StoreOrdersTable({ initialOrders }: StoreOrdersTableProps) {
  const [orders, setOrders] = useState<StoreOrder[]>(initialOrders)
  const [userMap, setUserMap] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [editingOrder, setEditingOrder] = useState<StoreOrder | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleEdit = (order: StoreOrder) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleDeliver = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ status: 'Levererad' })
        .eq('id', orderId)

      if (error) throw error

      toast.success("Store marked as delivered")
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'Levererad' } : order))
    } catch (error) {
      console.error('Error delivering store:', error)
      toast.error("Failed to update store status")
    }
  }

  const handleDelete = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('store_orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      toast.success("Order deleted successfully")
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error("Failed to delete order")
    }
  }

  const handleUpdate = async (orderId: string, updates: Partial<StoreOrder>) => {
    try {
      const { error } = await supabase
        .from('store_orders')
        .update(updates)
        .eq('id', orderId)

      if (error) throw error

      toast.success("Order updated successfully")
      setIsEditDialogOpen(false)
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, ...updates } : order))
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error("Failed to update order")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 py-2">Kund</TableHead>
              <TableHead className="px-2 py-2">Orderdatum</TableHead>
              <TableHead className="px-2 py-2">Status</TableHead>
              <TableHead className="px-2 py-2">Pris</TableHead>
              <TableHead className="px-2 py-2">Nisch</TableHead>
              <TableHead className="px-2 py-2 text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(6)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kund</TableHead>
            <TableHead className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Orderdatum</TableHead>
            <TableHead className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pris</TableHead>
            <TableHead className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nisch</TableHead>
            <TableHead className="px-2 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted transition-colors group"
              onClick={e => {
                // Prevent row click if dropdown menu is clicked
                if ((e.target as HTMLElement).closest('[role="menu"]')) return;
                router.push(`/admin/stores/${order.id}`)
              }}
            >
              <TableCell>
                <div>
                  <div className="font-medium">{userMap[order.user_id] || order.client_name || <span className="text-muted-foreground">—</span>}</div>
                  <div className="text-sm text-muted-foreground">{order.client_email}</div>
                </div>
              </TableCell>
              <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{
                typeof order.price === 'number'
                  ? order.price.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
                  : <span className="text-muted-foreground">—</span>
              }</TableCell>
              <TableCell>{order.niche}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Åtgärder</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/stores/${order.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Redigera beställning
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Ta bort beställning
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
          <form onSubmit={() => handleUpdate(editingOrder?.id || '', editingOrder || {})} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Butiksnamn</Label>
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
                value={editingOrder?.status || 'Väntar'}
                onValueChange={(value) => setEditingOrder(prev => prev ? { ...prev, status: value as StoreOrder['status'] } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Väntar">Pending</SelectItem>
                  <SelectItem value="Under utveckling">In Progress</SelectItem>
                  <SelectItem value="Granska">Ready for Review</SelectItem>
                  <SelectItem value="Levererad">Delivered</SelectItem>
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
