"use client"

import { Calendar, Clock } from "lucide-react"

interface Activity {
  date: string
  event: string
  description: string
}

export function RecentActivity() {
  // In a real application, this would come from the database
  const activities: Activity[] = [
    {
      date: "2024-03-20",
      event: "Order Placed",
      description: "Your store order has been received and is being processed.",
    },
    {
      date: "2024-03-21",
      event: "Initial Setup",
      description: "Store setup has begun. Our team is working on your store configuration.",
    },
    {
      date: "2024-03-22",
      event: "Theme Selection",
      description: "Store theme has been selected and customization is in progress.",
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {index !== activities.length - 1 && (
              <div className="h-full w-0.5 bg-border" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{activity.event}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(activity.date).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 