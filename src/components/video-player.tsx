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
  }, [videoId, supabase, onComplete])

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
  }, [videoId, isPlaying, supabase])

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
  }, [videoId, duration, supabase])

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
  }, [videoId, duration, supabase])

  useEffect(() => {
    if (!videoRef.current) return

    const handleTimeUpdate = () => {
      if (!videoRef.current) return
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setCurrentTime(videoRef.current.currentTime)
      setProgress(currentProgress)
      onProgressUpdate(currentProgress)
    }

    const handleLoadedMetadata = () => {
      if (!videoRef.current) return
      setDuration(videoRef.current.duration)
      if (initialProgress > 0 && !progressLoaded) {
        videoRef.current.currentTime = (initialProgress / 100) * videoRef.current.duration
        setProgress(initialProgress)
      }
    }

    videoRef.current.addEventListener('timeupdate', handleTimeUpdate)
    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [initialProgress, progressLoaded, onProgressUpdate])

  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0]
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleMuteToggle = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    const newTime = (value[0] / 100) * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleFullscreen = () => {
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setIsCompleted(true)
    if (videoId) {
      saveProgress(100, true)
    }
    onComplete?.()
  }

  return (
    <div className="relative w-full aspect-video bg-black" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onPause={handlePause}
        onEnded={handleEnded}
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white/80"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={handleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
