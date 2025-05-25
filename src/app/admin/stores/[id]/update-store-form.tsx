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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface UpdateStoreFormProps {
  storeId: string
  currentStatus: 'Väntar' | 'Under utveckling' | 'Granska' | 'Levererad'
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

      toast.success('Butikens status har uppdaterats')
      onUpdate()
    } catch (error) {
      console.error('Error updating store status:', error)
      toast.error('Failed to update store status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-xl border-2 border-border/60">
      <CardHeader className="rounded-t-lg pb-2">
        <CardTitle className="text-lg font-medium">Uppdatera orderstatus</CardTitle>
        <CardDescription>Ändra status och progress för denna order</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Status Step Indicator */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex gap-2 items-center">
              {["Väntar", "Under utveckling", "Granska", "Levererad"].map((s, i) => (
                <div key={s} className={`flex flex-col items-center ${status === s ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="mt-1 text-xs">{s}</span>
                </div>
              ))}
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as UpdateStoreFormProps['currentStatus'])}>
              <SelectTrigger className="mt-2 w-64">
                <SelectValue placeholder="Välj status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Väntar">Väntar</SelectItem>
                <SelectItem value="Under utveckling">Under utveckling</SelectItem>
                <SelectItem value="Granska">Granska</SelectItem>
                <SelectItem value="Levererad">Levererad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress visually grouped */}
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
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Uppdateringsanteckningar</Label>
            <Textarea
              id="notes"
              placeholder="Lägg till anteckningar om denna uppdatering (t.ex. vad som är klart, nästa steg, etc.)"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientMessage">Meddelande till kund (valfritt)</Label>
            <Textarea
              id="clientMessage"
              placeholder="Lägg till ett meddelande som skickas till kunden"
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uppdaterar...' : 'Uppdatera status'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
