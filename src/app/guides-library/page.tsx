"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import VideoPlayer from "@/components/video-player"
import VideoPlaylist, { Video } from "@/components/video-playlist"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// Sample video data
const videos: Video[] = [
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
  // Load video progress from localStorage or use default
  const [videoProgress, setVideoProgress] = useState<Record<number, number>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("videoProgress")
      if (stored) return JSON.parse(stored)
    }
    return Object.fromEntries(videos.map((video) => [video.id, video.progress]))
  })
  const [currentVideo, setCurrentVideo] = useState(videos[0])
  const [playedVideos, setPlayedVideos] = useState<Set<number>>(new Set([videos[0].id]))

  // Save video progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("videoProgress", JSON.stringify(videoProgress))
  }, [videoProgress])

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video)
    setPlayedVideos((prev) => new Set(prev).add(video.id))
  }

  const handleProgressUpdate = (videoId: number, progress: number) => {
    setVideoProgress((prev) => {
      const updated = { ...prev, [videoId]: progress }
      return updated
    })
    if (progress > 0) {
      setPlayedVideos((prev) => new Set(prev).add(videoId))
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg overflow-hidden bg-black">
                <VideoPlayer
                  src={currentVideo.src}
                  onProgressUpdate={(progress) => handleProgressUpdate(currentVideo.id, progress)}
                  initialProgress={videoProgress[currentVideo.id] || 0}
                  video={currentVideo}
                  hasBeenPlayed={playedVideos.has(currentVideo.id)}
                />
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
                    <VideoPlaylist
                      videos={videos}
                      currentVideoId={currentVideo.id}
                      progress={videoProgress}
                      onVideoSelect={handleVideoSelect}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
