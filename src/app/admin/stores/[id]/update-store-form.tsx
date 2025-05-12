"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface UpdateStoreFormProps {
  storeId: string
  currentStatus: 'pending' | 'in-progress' | 'review' | 'delivered'
  currentProgress: number
  onUpdate: () => void
}

export function UpdateStoreForm({ storeId, currentStatus, currentProgress, onUpdate }: UpdateStoreFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [progress, setProgress] = useState(currentProgress)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('store_orders')
        .update({
          status,
          progress,
        })
        .eq('id', storeId)

      if (error) throw error

      toast.success('Store status updated successfully')
      onUpdate()
    } catch (error) {
      console.error('Error updating store status:', error)
      toast.error('Failed to update store status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as UpdateStoreFormProps['currentStatus'])}>
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
        <Label htmlFor="progress">Progress</Label>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>{progress}%</span>
            <span>100%</span>
          </div>
        </div>
        <input
          type="range"
          id="progress"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Update Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add notes about this update (e.g., what was completed, next steps, etc.)"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientMessage">Message to Client (Optional)</Label>
        <Textarea
          id="clientMessage"
          placeholder="Add a message that will be sent to the client"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </form>
  )
}
