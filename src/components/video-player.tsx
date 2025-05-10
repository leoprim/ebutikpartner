"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface VideoPlayerProps {
  src: string
  onProgressUpdate: (progress: number) => void
  initialProgress: number
  videoId?: string
  onComplete?: () => void
}

export default function VideoPlayer({ src, onProgressUpdate, initialProgress, videoId, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key) => {
            const value = localStorage.getItem(key)
            if (!value) return null
            try {
              return JSON.parse(value)
            } catch {
              return null
            }
          },
          setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value))
          },
          removeItem: (key) => {
            localStorage.removeItem(key)
          }
        }
      }
    }
  )

  // Fetch progress and completion status on mount
  useEffect(() => {
    let isMounted = true

    const fetchProgress = async () => {
      if (!videoId) return
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No user found')
          return
        }

        const { data, error } = await supabase
          .from('video_progress')
          .select('progress, timestamp, is_completed')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .single()

        if (error) {
          console.error('Error fetching progress:', error)
          return
        }

        if (data && videoRef.current && isMounted) {
          console.log('Fetched progress:', data)
          // Set the video's current time to the saved timestamp
          videoRef.current.currentTime = data.timestamp
          setProgress(data.progress)
          setProgressLoaded(true)
          // Always set isCompleted based on the database value
          setIsCompleted(data.is_completed || false)
          if (data.is_completed) {
            onComplete?.()
          }
        }
      } catch (e) {
        console.error('Error fetching progress:', e)
      }
    }

    fetchProgress()

    return () => {
      isMounted = false
    }
  }, [videoId])

  // Save progress periodically during playback
  useEffect(() => {
    if (!videoId || !isPlaying) return

    const interval = setInterval(() => {
      if (videoRef.current) {
        const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
        saveProgress(currentProgress)
      }
    }, 5000) // Save every 5 seconds during playback

    return () => clearInterval(interval)
  }, [videoId, isPlaying])

  // Save progress (debounced)
  const saveProgress = async (progress: number, completed: boolean = false) => {
    if (!videoId) return
    const timestamp = videoRef.current ? videoRef.current.currentTime : 0
    // Round progress to integer
    const roundedProgress = Math.round(progress)
    console.log('Saving progress:', { videoId, progress: roundedProgress, timestamp, completed })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        return
      }

      // If the video was previously completed, maintain that status
      const { data: existingData } = await supabase
        .from('video_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single()

      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress: roundedProgress,
          timestamp,
          is_completed: completed || (existingData?.is_completed || false),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' })

      if (error) {
        console.error('Error saving progress:', error)
      }
    } catch (e) {
      console.error('Error saving progress:', e)
    }
  }

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoId && duration > 0) {
        const currentProgress = Math.round((videoRef.current.currentTime / duration) * 100)
        saveProgress(currentProgress)
      }
    }
  }, [videoId, duration])

  // Save progress when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current && videoId && duration > 0) {
        const currentProgress = Math.round((videoRef.current.currentTime / duration) * 100)
        saveProgress(currentProgress)
      }
    }

    // Handle browser/tab close
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Handle Next.js client-side navigation
    const handleRouteChange = () => {
      if (videoRef.current && videoId && duration > 0) {
        const currentProgress = Math.round((videoRef.current.currentTime / duration) * 100)
        saveProgress(currentProgress)
      }
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [videoId, duration])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const progressPercent = Math.floor((video.currentTime / video.duration) * 100)
      onProgressUpdate(progressPercent)
      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress(progressPercent)
      }, 1000)
    }

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration)
      setDuration(video.duration)
      // Only set initial progress if we haven't loaded saved progress
      if (!progressLoaded && initialProgress > 0 && initialProgress < 100) {
        const timeToSet = (initialProgress / 100) * video.duration
        console.log('Setting initial time to:', timeToSet)
        video.currentTime = timeToSet
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [onProgressUpdate, initialProgress, videoId, progressLoaded])

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

  // Save progress on pause or end
  const handlePause = () => {
    setIsPlaying(false)
    if (videoRef.current && videoId) {
      const progressPercent = Math.floor((videoRef.current.currentTime / duration) * 100)
      saveProgress(progressPercent)
    }
  }
  const handleEnded = () => {
    setIsPlaying(false)
    setIsCompleted(true)
    if (videoId) {
      saveProgress(100, true)
    }
    onProgressUpdate(100)
    onComplete?.()
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
        onPause={handlePause}
        onEnded={handleEnded}
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
