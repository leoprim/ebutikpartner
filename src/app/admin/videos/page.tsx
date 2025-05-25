"use client"

import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { createBrowserClient } from '@supabase/ssr'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoUploadDialog } from "@/components/video-upload-dialog"
import { VideoEditDialog } from "@/components/video-edit-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  is_published: boolean
  created_at: string
  duration?: string
  view_count?: number
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin, isLoading: isAdminLoading } = useAdmin()
  const router = useRouter()
  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ).current
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      console.log('AdminVideosPage - Not an admin, redirecting to home')
      toast.error("You must be an admin to access this page")
      router.push("/")
    }
  }, [isAdmin, isAdminLoading, router])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    fetchUser()
  }, [supabase])

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setVideos(data)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast.error("Failed to load videos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchVideos()
    }
  }, [isAdmin, supabase])

  const toggleVideoStatus = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_published: !currentStatus })
        .eq('id', videoId)

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

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      setVideos(videos.filter(video => video.id !== videoId))
      toast.success("Video borttagen")
    } catch (error) {
      console.error("Kunde inte ta bort video:", error)
      toast.error("Kunde inte ta bort video")
    }
  }

  if (isLoading || isAdminLoading) {
    return null;
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ladda upp video
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
                  {video.view_count || 0} visningar
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleVideoStatus(video.id, video.is_published)}
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
                  onClick={() => deleteVideo(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {video.description || "Ingen beskrivning"}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                Längd: {video.duration || "Okänd"}
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
          user={user}
          supabase={supabase}
        />
      )}
    </div>
  )
} 