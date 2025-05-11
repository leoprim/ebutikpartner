"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import VideoPlayer from "@/components/video-player"
import VideoPlaylist from "@/components/video-playlist"
import { createBrowserClient } from "@supabase/ssr"
import { VideoUploadDialog } from "@/components/video-upload-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Video {
  id: string
  title: string
  description: string | null
  duration: string | null
  thumbnail_url: string | null
  video_url: string
  src: string
  is_published: boolean
  order_index: number
}

interface PlaylistVideo {
  id: number
  title: string
  duration: string
  thumbnail: string
  progress: number
  isCompleted: boolean
}

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

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({})
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({})
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        const formattedVideos = await Promise.all(
          data.map(async video => {
            // Get the public URL for the video file
            const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(video.video_url)
            return {
              ...video,
              src: publicUrlData?.publicUrl || '',
            }
          })
        )
        setVideos(formattedVideos)
        setCurrentVideo(formattedVideos[0])
        setVideoProgress(
          Object.fromEntries(formattedVideos.map((video) => [video.id, 0]))
        )
        setCompletedVideos(
          Object.fromEntries(formattedVideos.map((video) => [video.id, false]))
        )
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const handleVideoSelect = (video: PlaylistVideo) => {
    const selectedVideo = videos.find(v => v.id === video.id.toString())
    if (selectedVideo) {
      setCurrentVideo(selectedVideo)
    }
  }

  const handleProgressUpdate = (videoId: string, progress: number) => {
    setVideoProgress((prev) => ({
      ...prev,
      [videoId]: progress,
    }))
  }

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos((prev) => ({
      ...prev,
      [videoId]: true,
    }))
  }

  if (isLoading) {
    return null
  }

  if (!currentVideo) {
    return (
      <div className="w-full p-6">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            <div className="rounded-lg overflow-hidden bg-muted">
              <div className="aspect-video">
                <Skeleton className="w-full h-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-6" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative w-28 h-16 bg-muted rounded-md overflow-hidden">
                        <Skeleton className="absolute inset-0" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const playlistVideos: PlaylistVideo[] = videos.map(video => ({
    id: parseInt(video.id),
    title: video.title,
    duration: video.duration || "0:00",
    thumbnail: video.thumbnail_url || "/placeholder.svg",
    progress: videoProgress[video.id] || 0,
    isCompleted: completedVideos[video.id] || false
  }))

  return (
    <div className="w-full p-6">
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <div className="rounded-lg overflow-hidden bg-black">
            <VideoPlayer
              src={currentVideo.src}
              onProgressUpdate={(progress) => handleProgressUpdate(currentVideo.id, progress)}
              initialProgress={videoProgress[currentVideo.id] || 0}
              videoId={currentVideo.id}
              onComplete={() => handleVideoComplete(currentVideo.id)}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{currentVideo.title}</h2>
            <p className="text-muted-foreground">{currentVideo.description}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-6">Tutorials</h3>
              <ScrollArea className="h-[500px] pr-4">
                <VideoPlaylist
                  videos={playlistVideos}
                  currentVideoId={parseInt(currentVideo.id)}
                  progress={Object.fromEntries(
                    Object.entries(videoProgress).map(([key, value]) => [parseInt(key), value])
                  )}
                  onVideoSelect={handleVideoSelect}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <VideoUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSuccess={fetchVideos}
      />
    </div>
  )
} 