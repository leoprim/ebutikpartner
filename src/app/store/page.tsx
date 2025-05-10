"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export default function Page() {
  const [currentVideo, setCurrentVideo] = useState(videos[0])
  const [videoProgress, setVideoProgress] = useState<Record<number, number>>(
    Object.fromEntries(videos.map((video) => [video.id, video.progress])),
  )

  const handleVideoSelect = (video: (typeof videos)[0]) => {
    setCurrentVideo(video)
  }

  const handleProgressUpdate = (videoId: number, progress: number) => {
    setVideoProgress((prev) => ({
      ...prev,
      [videoId]: progress,
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Guides Library</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg overflow-hidden bg-black">
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{currentVideo.title}</h2>
            <p className="text-muted-foreground">{currentVideo.description}</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Guides Library Playlist</h3>
              <ScrollArea className="h-[500px] pr-4">
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
