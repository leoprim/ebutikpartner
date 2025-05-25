"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { addToast } from "@heroui/react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
}

interface VideoEditDialogProps {
  video: Video
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComplete?: () => void
  user: any
  supabase: any
}

export function VideoEditDialog({ 
  video, 
  open,
  onOpenChange,
  onEditComplete,
  user,
  supabase
}: VideoEditDialogProps) {
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(video.thumbnail_url)
  const [isUploading, setIsUploading] = useState(false)

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
    console.log("Form submitted")
    if (!title) {
      console.log("No title provided, aborting submit")
      return
    }

    try {
      setIsUploading(true)
      console.log("Starting upload process")

      // Upload thumbnail if provided
      let thumbnailUrl = video.thumbnail_url
      if (thumbnailFile) {
        console.log("Uploading thumbnail")
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(`thumbnails/${user.id}/${thumbnailFileName}`, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (thumbnailError) {
          console.error("Thumbnail upload error:", thumbnailError)
          throw thumbnailError
        }

        // Get the public URL for the uploaded thumbnail
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(`thumbnails/${user.id}/${thumbnailFileName}`)

        thumbnailUrl = publicUrl
        console.log("Thumbnail uploaded successfully:", thumbnailUrl)
      }

      // Update video record in database
      console.log("Updating video record", { title, description, thumbnailUrl, videoId: video.id })
      const { data: updateData, error: dbError } = await supabase
        .from('videos')
        .update({
          title,
          description,
          thumbnail_url: thumbnailUrl
        })
        .eq('id', video.id)
        .select()

      console.log('Update result:', { updateData, dbError, videoId: video.id })

      if (dbError) {
        console.error("Database update error:", dbError)
        throw dbError
      }

      if (!updateData || updateData.length === 0) {
        console.error("No video was updated. Check if the video id exists.", video.id)
        addToast({ title: "Failed to update video. Video not found.", color: "danger" })
        setIsUploading(false)
        return
      }

      console.log("Video updated successfully")
      addToast({ title: "Video updated successfully", color: "success" })
      onOpenChange(false)
      onEditComplete?.()
    } catch (error) {
      console.error('Error updating video:', error)
      addToast({ title: "Failed to update video. Please try again.", color: "danger" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
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
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
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
              {isUploading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 