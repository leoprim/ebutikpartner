"use client"

import Image from "next/image"
import { Check, Play } from "lucide-react"

interface Video {
  id: number
  title: string
  duration: string
  thumbnail: string
  progress: number
  isCompleted: boolean
}

interface VideoPlaylistProps {
  videos: Video[]
  currentVideoId: number
  progress: Record<number, number>
  onVideoSelect: (video: Video) => void
}

export default function VideoPlaylist({ videos, currentVideoId, progress, onVideoSelect }: VideoPlaylistProps) {
  return (
    <div className="space-y-3">
      {videos.map((video) => {
        const isActive = video.id === currentVideoId
        const currentProgress = progress[video.id] || 0
        const isCompleted = video.isCompleted || currentProgress === 100

        return (
          <div
            key={video.id}
            className={`flex gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              isActive ? "bg-muted" : "hover:bg-muted/50"
            }`}
            onClick={() => onVideoSelect(video)}
          >
            <div className="relative flex-shrink-0">
              <Image
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                width={90}
                height={50}
                className="rounded-md object-cover w-[90px] h-[51px]"
              />

              {/* Play indicator for current video */}
              {isActive && !isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              )}

              {/* Progress bar */}
              {currentProgress > 0 && currentProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden m-1">
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
