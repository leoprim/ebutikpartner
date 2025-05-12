"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Task {
  id: string
  title: string
  description: string
  status: "completed" | "in-progress" | "pending"
}

export function StoreSetupTasks() {
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      title: "Store setup",
      description: "Basic store information and settings",
      status: "completed",
    },
    {
      id: "2",
      title: "Product catalog",
      description: "Add products, descriptions, and images",
      status: "in-progress",
    },
    {
      id: "3",
      title: "Theme customization",
      description: "Customize store appearance and branding",
      status: "in-progress",
    },
    {
      id: "4",
      title: "Payment gateway",
      description: "Set up payment methods and checkout",
      status: "pending",
    },
    {
      id: "5",
      title: "Shipping settings",
      description: "Configure shipping rates and zones",
      status: "pending",
    },
    {
      id: "6",
      title: "Tax configuration",
      description: "Set up tax rates and settings",
      status: "pending",
    },
  ])

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const progressPercentage = (completedTasks / tasks.length) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg">Store Setup Tasks</h3>
          <p className="text-sm text-muted-foreground">Complete these tasks to launch your store</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {completedTasks} of {tasks.length} completed
          </p>
          <p className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% complete</p>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2 mb-4" />
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start">
            <div className="mr-2 mt-0.5">
              {task.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : task.status === "in-progress" ? (
                <Clock className="h-5 w-5 text-amber-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground font-normal">{task.description}</p>
            </div>
            <div className="ml-auto text-xs">
              {task.status === "completed" ? (
                <span className="text-green-500">Completed</span>
              ) : task.status === "in-progress" ? (
                <span className="text-amber-500">In Progress</span>
              ) : (
                <span className="text-muted-foreground">Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
