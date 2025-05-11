"use client"

import { CheckCircle2, Circle } from "lucide-react"

interface StoreSetupTasksProps {
  requirements: string[]
}

export function StoreSetupTasks({ requirements }: StoreSetupTasksProps) {
  return (
    <div className="space-y-4">
      {requirements.map((requirement, index) => (
        <div key={index} className="flex items-start gap-3">
          <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{requirement}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </div>
      ))}
    </div>
  )
} 