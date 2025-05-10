"use client"

import Image from "next/image"
import { Check, Play } from "lucide-react"
import { useEffect, useState } from "react"

export interface Video {
  id: number
  title: string
  description: string
  duration: string
  thumbnail?: string
  src: string
  progress: number
}

interface VideoPlaylistProps {
  videos: Video[]
  currentVideoId: number
  progress: Record<number, number>
  onVideoSelect: (video: Video) => void
}

export default function VideoPlaylist({ videos, currentVideoId, progress, onVideoSelect }: VideoPlaylistProps) {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({})

  useEffect(() => {
    videos.forEach((video) => {
      if (!video.thumbnail && !thumbnails[video.id]) {
        const videoEl = document.createElement("video")
        videoEl.src = video.src
        videoEl.crossOrigin = "anonymous"
        videoEl.currentTime = 0
        videoEl.muted = true
        videoEl.playsInline = true
        videoEl.addEventListener("loadeddata", () => {
          const canvas = document.createElement("canvas")
          canvas.width = videoEl.videoWidth
          canvas.height = videoEl.videoHeight
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL("image/png")
            setThumbnails((prev) => ({ ...prev, [video.id]: dataUrl }))
          }
        }, { once: true })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  return (
    <div className="space-y-3">
      {videos.map((video) => {
        const isActive = video.id === currentVideoId
        const currentProgress = progress[video.id] || 0
        const isCompleted = currentProgress === 100
        const thumbSrc = video.thumbnail || thumbnails[video.id] || "/placeholder.svg"

        return (
          <div
            key={video.id}
            className={`flex gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              isCompleted ? "bg-green-100" : isActive ? "bg-muted" : "hover:bg-muted/50"
            }`}
            onClick={() => onVideoSelect(video)}
          >
            <div className="relative flex-shrink-0">
              <Image
                src={thumbSrc}
                alt={video.title}
                width={90}
                height={50}
                className="rounded-md object-cover w-[90px] h-[50px]"
              />

              {/* Play indicator for current video */}
              {isActive && !isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              )}

              {/* Progress bar */}
              {currentProgress > 0 && currentProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${currentProgress}%` }} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <h4 className="text-sm font-medium line-clamp-2 flex-1">{video.title}</h4>

                {/* Completed indicator */}
                {isCompleted && (
                  <span className="flex-shrink-0 rounded-full bg-green-100 p-1 text-green-600">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-1">{video.duration}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
