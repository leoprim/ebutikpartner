"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react"
import { Video } from "./video-playlist"

interface VideoPlayerProps {
  src: string
  onProgressUpdate: (progress: number) => void
  initialProgress: number
  video: Video
  onVideoSelect?: (video: Video) => void
  hasBeenPlayed?: boolean
}

export default function VideoPlayer({ src, onProgressUpdate, initialProgress, video, onVideoSelect, hasBeenPlayed }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const progressPercent = Math.floor((video.currentTime / video.duration) * 100)
      onProgressUpdate(progressPercent)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [onProgressUpdate])

  // Seek to initialProgress when it changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || !duration) return
    if (initialProgress > 0 && initialProgress < 100) {
      video.currentTime = (initialProgress / 100) * duration
      setCurrentTime(video.currentTime)
    } else if (initialProgress === 100) {
      video.currentTime = video.duration
      setCurrentTime(video.duration)
    } else if (initialProgress === 0) {
      video.currentTime = 0
      setCurrentTime(0)
    }
  }, [initialProgress, duration, video])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false))
    } else {
      video.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = volume
    video.muted = isMuted
  }, [volume, isMuted])

  useEffect(() => {
    if (hasBeenPlayed) {
      setIsMuted(false)
      setIsPlaying(true)
    } else {
      setIsMuted(true)
      setIsPlaying(true)
    }
  }, [video, hasBeenPlayed])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return
    if (isPlaying) {
      const playPromise = videoEl.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay might be blocked; ignore error
        })
      }
    }
  }, [src, isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (value[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div
      className="relative group w-full aspect-video bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={handlePlayPause}
        onEnded={() => {
          setIsPlaying(false)
          onProgressUpdate(100)
        }}
      />

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={handlePlayPause}
          >
            <Play className="w-8 h-8 fill-white" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="space-y-2">
          <Slider
            value={[currentTime ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
          />

          <div className="flex items-center gap-3 text-white">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={handleMuteToggle}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                />
              </div>
            </div>

            <div className="text-xs ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 ml-auto"
              onClick={handleFullscreen}
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
