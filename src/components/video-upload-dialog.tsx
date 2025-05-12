"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { getVideoDuration, formatDuration } from "@/lib/video-utils"

interface VideoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function VideoUploadDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: VideoUploadDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [duration, setDuration] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      try {
        const durationInSeconds = await getVideoDuration(file)
        setDuration(formatDuration(durationInSeconds))
      } catch (error) {
        console.error('Error getting video duration:', error)
        toast.error('Failed to get video duration')
      }
    }
  }

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile || !title) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to upload videos")
      }

      // Upload video file
      const videoFileName = `${Date.now()}-${videoFile.name}`
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (videoError) throw videoError

      // Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(`thumbnails/${user.id}/${thumbnailFileName}`, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (thumbnailError) throw thumbnailError

        // Get the public URL for the uploaded thumbnail
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(`thumbnails/${user.id}/${thumbnailFileName}`)

        thumbnailUrl = publicUrl
      }

      // Create video record in database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          video_url: videoData.path,
          thumbnail_url: thumbnailUrl,
          duration,
          created_by: user.id,
          is_published: true,
          order_index: 0 // You might want to implement a way to set this
        })

      if (dbError) throw dbError

      toast.success("Video uploaded successfully")

      // Reset form
      setTitle("")
      setDescription("")
      setVideoFile(null)
      setThumbnailFile(null)
      setThumbnailPreview(null)
      setDuration(null)
      onOpenChange(false)
      onSuccess?.()

    } catch (error) {
      console.error('Error uploading video:', error)
      toast.error("Failed to upload video. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              required
            />
            {duration && (
              <p className="text-sm text-muted-foreground">
                Duration: {duration}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <div className="flex items-center gap-4">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileChange}
              />
              {thumbnailPreview && (
                <div className="relative w-20 h-20">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null)
                      setThumbnailPreview(null)
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 