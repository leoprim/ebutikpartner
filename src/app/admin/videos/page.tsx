"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoUploadDialog } from "@/components/video-upload-dialog"
import { VideoEditDialog } from "@/components/video-edit-dialog"
import { useAdmin } from "@/hooks/use-admin"

interface Video {
  id: string
  title: string
  description: string | null
  duration: string | null
  thumbnail_url: string | null
  video_url: string
  is_published: boolean
  order_index: number
  created_at: string
  view_count?: number
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin, isLoading: isAdminLoading } = useAdmin()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('AdminVideosPage - Admin status:', { isAdmin, isAdminLoading })
    
    if (!isAdminLoading && !isAdmin) {
      console.log('AdminVideosPage - Not an admin, redirecting to home')
      toast.error("You must be an admin to access this page")
      router.push("/")
    }
  }, [isAdmin, isAdminLoading, router])

  useEffect(() => {
    if (isAdmin) {
      console.log('AdminVideosPage - Fetching videos')
      fetchVideos()
    }
  }, [isAdmin])

  const fetchVideos = async () => {
    try {
      // First get all videos
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("order_index", { ascending: true })

      if (videosError) throw videosError

      // Then get view counts for each video
      const { data: analytics, error: analyticsError } = await supabase
        .from("video_analytics")
        .select("video_id, view_count")
        .in("video_id", videos.map(v => v.id))

      if (analyticsError) throw analyticsError

      // Combine the data
      const videosWithViews = videos.map(video => ({
        ...video,
        view_count: analytics
          ?.filter(a => a.video_id === video.id)
          .reduce((sum, a) => sum + a.view_count, 0) || 0
      }))

      setVideos(videosWithViews)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast.error("Failed to load videos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePublish = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("videos")
        .update({ is_published: !currentStatus })
        .eq("id", videoId)

      if (error) throw error

      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, is_published: !currentStatus }
          : video
      ))
      
      toast.success(`Video ${!currentStatus ? "published" : "unpublished"} successfully`)
    } catch (error) {
      console.error("Error toggling video status:", error)
      toast.error("Failed to update video status")
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      // Get the video details first
      const { data: video, error: fetchError } = await supabase
        .from("videos")
        .select("video_url, thumbnail_url")
        .eq("id", videoId)
        .single()

      if (fetchError) throw fetchError

      // Delete the video file from storage
      if (video.video_url) {
        const { error: videoError } = await supabase.storage
          .from('videos')
          .remove([video.video_url])

        if (videoError) throw videoError
      }

      // Delete the thumbnail file from storage if it exists
      if (video.thumbnail_url) {
        // Extract the path from the full URL
        const thumbnailPath = video.thumbnail_url.split('/').slice(-2).join('/')
        const { error: thumbnailError } = await supabase.storage
          .from('videos')
          .remove([`thumbnails/${thumbnailPath}`])

        if (thumbnailError) throw thumbnailError
      }

      // Delete the database record
      const { error: dbError } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId)

      if (dbError) throw dbError

      setVideos(videos.filter(video => video.id !== videoId))
      toast.success("Video deleted successfully")
    } catch (error) {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
    }
  }

  if (isAdminLoading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{video.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm text-muted-foreground mr-2">
                  <BarChart2 className="w-4 h-4 mr-1" />
                  {video.view_count || 0} views
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTogglePublish(video.id, video.is_published)}
                >
                  {video.is_published ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingVideo(video)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {video.description || "No description"}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                Duration: {video.duration || "Unknown"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <VideoUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSuccess={() => {
          fetchVideos()
          setIsUploadDialogOpen(false)
        }}
      />

      {editingVideo && (
        <VideoEditDialog
          video={{
            id: editingVideo.id,
            title: editingVideo.title,
            description: editingVideo.description || "",
            thumbnail_url: editingVideo.thumbnail_url
          }}
          open={!!editingVideo}
          onOpenChange={(open) => !open && setEditingVideo(null)}
          onEditComplete={() => {
            fetchVideos()
            setEditingVideo(null)
          }}
        />
      )}
    </div>
  )
} 