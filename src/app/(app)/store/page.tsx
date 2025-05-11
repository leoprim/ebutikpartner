"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, Package, ShoppingBag, Store, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivity } from "../dashboard/recent-activity"
import { StoreSetupTasks } from "../dashboard/store-setup-tasks"

// Sample video data
const videos = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    description: "Learn the basics of Next.js and how to set up your first project.",
    duration: "10:25",
    thumbnail: "/placeholder.svg?height=90&width=160",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    progress: 100, // Completed
  },
  {
    id: 2,
    title: "Building Responsive Layouts",
    description: "Master responsive design techniques using Tailwind CSS.",
    duration: "8:15",
    thumbnail: "/placeholder.svg?height=90&width=160",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    progress: 45, // In progress
  },
  {
    id: 3,
    title: "Server Components in Next.js",
    description: "Understand how server components work and when to use them.",
    duration: "12:30",
    thumbnail: "/placeholder.svg?height=90&width=160",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    progress: 0, // Not started
  },
  {
    id: 4,
    title: "Authentication with NextAuth.js",
    description: "Implement user authentication in your Next.js application.",
    duration: "15:45",
    thumbnail: "/placeholder.svg?height=90&width=160",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    progress: 0, // Not started
  },
  {
    id: 5,
    title: "Working with Databases",
    description: "Connect your Next.js app to a database and perform CRUD operations.",
    duration: "14:20",
    thumbnail: "/placeholder.svg?height=90&width=160",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    progress: 0, // Not started
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function StorePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentVideo, setCurrentVideo] = useState(videos[0])
  const [videoProgress, setVideoProgress] = useState<Record<number, number>>(
    Object.fromEntries(videos.map((video) => [video.id, video.progress])),
  )

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleVideoSelect = (video: (typeof videos)[0]) => {
    setCurrentVideo(video)
  }

  const handleProgressUpdate = (videoId: number, progress: number) => {
    setVideoProgress((prev) => ({
      ...prev,
      [videoId]: progress,
    }))
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="flex-1 p-6">
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Store Progress</CardTitle>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Progress</Badge>
              </div>
              <CardDescription className="text-sm font-normal">Your store "Fashion Boutique" is 65% complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    <span>Store setup</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    <span>Products added</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-amber-500" />
                    <span>Theme customization</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-amber-500" />
                    <span>Payment setup</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Store className="mr-2 h-4 w-4" />
                View Store
              </Button>
              <Button size="sm">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Store Settings
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Delivery</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">7 days</div>
              <p className="text-xs text-muted-foreground font-normal">Based on current progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Added</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">24/30</div>
              <p className="text-xs text-muted-foreground font-normal">80% of product catalog complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Niche</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">Health & Beauty</div>
              <p className="text-xs text-muted-foreground font-normal">Based on your choice</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Hours</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">1 hours</div>
              <p className="text-xs text-muted-foreground font-normal">Remaining support time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Tasks & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="w-full border relative">
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out" 
                       style={{ 
                         transform: 'translateX(0%)',
                         width: '50%',
                         backgroundColor: 'hsl(var(--background))',
                         border: '1px solid hsl(var(--border))',
                         borderRadius: '0.375rem'
                       }} 
                       data-state="tasks" />
                  <TabsTrigger value="tasks" className="flex-1 relative z-10 transition-colors duration-300">Setup Tasks</TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1 relative z-10 transition-colors duration-300">Recent Activity</TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <TabsContent value="tasks" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StoreSetupTasks />
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="activity" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RecentActivity />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium">Theme Customization</p>
                  <p className="text-sm text-muted-foreground">Due in 3 days</p>
                </div>
                <Badge>High Priority</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium">Payment Gateway Setup</p>
                  <p className="text-sm text-muted-foreground">Due in 5 days</p>
                </div>
                <Badge variant="outline">Medium</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Final Review</p>
                  <p className="text-sm text-muted-foreground">Due in 7 days</p>
                </div>
                <Badge variant="outline">Medium</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View all milestones
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
