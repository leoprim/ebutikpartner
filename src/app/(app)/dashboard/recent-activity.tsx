import type React from "react"
import { CalendarDays, Package, Settings, ShoppingCart, Store, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActivityItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
    initials: string
  }
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      icon: <Package className="h-4 w-4" />,
      title: "Product added",
      description: "New product 'Summer Collection Dress' was added",
      timestamp: "2 hours ago",
      user: {
        name: "Admin",
        initials: "AD",
      },
    },
    {
      id: "2",
      icon: <Store className="h-4 w-4" />,
      title: "Theme updated",
      description: "Store theme was updated to 'Minimal'",
      timestamp: "Yesterday",
      user: {
        name: "System",
        initials: "SY",
      },
    },
    {
      id: "3",
      icon: <Settings className="h-4 w-4" />,
      title: "Store settings changed",
      description: "Store currency was updated to USD",
      timestamp: "2 days ago",
      user: {
        name: "Admin",
        initials: "AD",
      },
    },
    {
      id: "4",
      icon: <ShoppingCart className="h-4 w-4" />,
      title: "Test order placed",
      description: "A test order was placed to verify checkout",
      timestamp: "3 days ago",
      user: {
        name: "System",
        initials: "SY",
      },
    },
    {
      id: "5",
      icon: <User className="h-4 w-4" />,
      title: "Account created",
      description: "Your store account was created",
      timestamp: "1 week ago",
      user: {
        name: "Admin",
        initials: "AD",
      },
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-medium text-lg">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest updates and changes to your store</p>
      </div>
      <div className="space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">{activity.icon}</div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </div>
            {activity.user && (
              <div className="ml-auto">
                <Avatar className="h-8 w-8">
                  {activity.user.avatar && (
                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                  )}
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
