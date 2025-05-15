"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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

// Add this outside of the component to create a shared cache
const fetchedProgressCache = new Map<string, boolean>();
// Use a global variable to track console logs to avoid duplicate logs in development
const loggedProgressIds = new Set<string>();

export default function VideoPlayer({ src, onProgressUpdate, initialProgress, videoId, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const isMountedRef = useRef(true)
  const hasFetchedRef = useRef(false)
  // Use ref to track the last progress update time to throttle updates
  const lastUpdateRef = useRef(0)
  
  // Reset cache when component unmounts
  useEffect(() => {
    // Reset and cleanup
    return () => {
      if (videoId) {
        fetchedProgressCache.delete(videoId);
      }
    };
  }, [videoId]);
  
  // Create supabase client only once
  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: 'supabase.auth.token',
          detectSessionInUrl: false, // Prevent default URL detection
          autoRefreshToken: true, // Enable token refresh
          flowType: 'pkce', // Use PKCE flow for better security
          debug: false, // Disable debug logs
          storage: {
            getItem: (key) => {
              if (typeof window === 'undefined') return null
              const value = localStorage.getItem(key)
              if (!value) return null
              try {
                return JSON.parse(value)
              } catch {
                console.log('Failed to parse auth data, returning raw value')
                return value
              }
            },
            setItem: (key, value) => {
              if (typeof window === 'undefined') return
              const strValue = typeof value === 'string' ? value : JSON.stringify(value)
              localStorage.setItem(key, strValue)
            },
            removeItem: (key) => {
              if (typeof window === 'undefined') return
              localStorage.removeItem(key)
            }
          }
        }
      }
    )
  ).current
  
  // Initialize auth on mount
  useEffect(() => {
    // Force refresh the session when component mounts
    if (typeof window !== 'undefined') {
      const initAuth = async () => {
        try {
          await supabase.auth.getSession()
        } catch (error) {
          console.error('Error initializing auth:', error)
        }
      }
      
      initAuth()
    }
    
    return () => {
      // No cleanup needed
    }
  }, [supabase.auth])

  // Reset isMounted flag on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      hasFetchedRef.current = false // Reset hasFetchedRef on unmount
    }
  }, [])

  // Create saveProgress function with useCallback to avoid recreating it on every render
  const saveProgress = useCallback(async (progressValue: number, completed: boolean = false) => {
    if (!videoId || !isMountedRef.current) return
    const timestamp = videoRef.current ? videoRef.current.currentTime : 0
    // Round progress to integer
    const roundedProgress = Math.round(progressValue)
    
    // Don't save if progress hasn't changed by at least 1%
    if (!completed && Math.abs(roundedProgress - progress) < 1) {
      return
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isMountedRef.current) {
        return
      }

      // If the video was previously completed, maintain that status
      const { data: existingData, error: existingError } = await supabase
        .from('video_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle() // Use maybeSingle instead of single to prevent error

      // Only proceed with upsert if fetching existing data didn't error (except for no rows)
      if ((!existingError || existingError.code === 'PGRST116') && isMountedRef.current) {
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
      }
    } catch (e) {
      console.error('Error saving progress:', e)
    }
  }, [videoId, supabase, progress])

  // Fetch progress and completion status on mount
  useEffect(() => {
    // Check both the local ref and the static cache
    if (!videoId || hasFetchedRef.current || fetchedProgressCache.has(videoId)) return
    
    // Mark as fetched in the shared cache
    fetchedProgressCache.set(videoId, true);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !isMountedRef.current) {
          // If not logged in, retry a few times (might be in the process of refreshing token)
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchProgress, 1000); // Try again in 1 second
          }
          return
        }

        const { data, error } = await supabase
          .from('video_progress')
          .select('progress, timestamp, is_completed')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .maybeSingle() // Use maybeSingle instead of single to prevent error when no row found

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine for new videos
          console.error('Error fetching progress:', error)
          return
        }

        if (data && isMountedRef.current) {
          // Only log in development and use a Set to prevent duplicate logs
          if (process.env.NODE_ENV === 'development' && videoId && !loggedProgressIds.has(videoId)) {
            console.log('Fetched progress:', data)
            loggedProgressIds.add(videoId);
          }
          
          // Store the timestamp in component state for later use
          // Rather than directly setting currentTime which might not work if video isn't loaded
          setProgress(data.progress)
          setProgressLoaded(true)
          
          // Set timestamp if video is already loaded
          if (videoRef.current && videoRef.current.readyState >= 2) {
            videoRef.current.currentTime = data.timestamp;
            setCurrentTime(data.timestamp);
          } else {
            // Store timestamp for when video loads
            videoRef.current?.addEventListener('loadedmetadata', () => {
              if (videoRef.current && isMountedRef.current) {
                videoRef.current.currentTime = data.timestamp;
                setCurrentTime(data.timestamp);
              }
            }, { once: true });
          }
          
          // Always set isCompleted based on the database value
          if (data.is_completed) {
            onComplete?.()
          }
        }
        
        // Mark as having fetched progress
        hasFetchedRef.current = true
      } catch (e) {
        console.error('Error fetching progress:', e)
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchProgress, 1000); // Try again in 1 second
        }
      }
    }

    // Only fetch once when component mounts
    fetchProgress()
  }, [videoId, supabase, onComplete]) // Only re-run if videoId changes

  // Save progress periodically during playback
  useEffect(() => {
    if (!videoId || !isPlaying) return

    // Track the last saved progress value to avoid unnecessary saves
    let lastSavedProgress = progress
    
    const interval = setInterval(() => {
      if (videoRef.current && isMountedRef.current) {
        const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
        // Only save if progress has changed by at least 1%
        if (Math.abs(currentProgress - lastSavedProgress) >= 1) {
          saveProgress(currentProgress)
          lastSavedProgress = currentProgress
        }
      }
    }, 10000) // Save at most every 10 seconds during playback (increased from 5s)

    return () => clearInterval(interval)
  }, [videoId, isPlaying, saveProgress, progress])

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoId && duration > 0) {
        const currentProgress = Math.round((videoRef.current.currentTime / duration) * 100)
        saveProgress(currentProgress)
      }
    }
  }, [videoId, duration, saveProgress])

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
  }, [videoId, duration, saveProgress])

  // Setup video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const handleTimeUpdate = () => {
      if (!videoRef.current || !isMountedRef.current) return
      
      const time = videoRef.current.currentTime
      const videoDuration = videoRef.current.duration || 0
      
      if (isNaN(time) || isNaN(videoDuration) || videoDuration === 0) return
      
      // Throttle updates to every 250ms to reduce unnecessary renders
      const now = Date.now()
      if (now - lastUpdateRef.current < 250) {
        return
      }
      
      lastUpdateRef.current = now
      const calculatedProgress = (time / videoDuration) * 100
      
      if (isMountedRef.current) {
        setCurrentTime(time)
        setProgress(calculatedProgress)
        onProgressUpdate(calculatedProgress)
      }
    }

    const handleLoadedMetadata = () => {
      if (!videoRef.current || !isMountedRef.current) return
      
      const videoDuration = videoRef.current.duration
      if (isMountedRef.current) {
        setDuration(videoDuration)
        
        // First priority: if we have stored timestamp from DB, use that
        if (progressLoaded && videoRef.current.currentTime <= 0) {
          // This is likely a refresh case where we need to re-apply the timestamp
          // Check if progress is set but currentTime is still 0
          (async () => {
            try {
              const { data } = await supabase.auth.getSession();
              // Only proceed if we're authenticated
              if (data.session && videoRef.current && isMountedRef.current && videoId) {
                const { data: progressData, error } = await supabase
                  .from('video_progress')
                  .select('timestamp')
                  .eq('user_id', data.session.user.id)
                  .eq('video_id', videoId)
                  .maybeSingle();
                  
                if (error) {
                  console.error('Error re-fetching timestamp:', error);
                  return;
                }
                
                if (progressData && videoRef.current && isMountedRef.current) {
                  videoRef.current.currentTime = progressData.timestamp;
                  setCurrentTime(progressData.timestamp);
                }
              }
            } catch (error) {
              console.error('Error in handleLoadedMetadata:', error);
            }
          })();
        }
        // Second priority: use initialProgress from props
        else if (initialProgress > 0 && !progressLoaded) {
          const initialTime = (initialProgress / 100) * videoDuration
          videoRef.current.currentTime = initialTime
          setProgress(initialProgress)
          setCurrentTime(initialTime)
        }
      }
    }
    
    const handleDurationChange = () => {
      if (!videoRef.current || !isMountedRef.current) return
      setDuration(videoRef.current.duration)
    }

    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('durationchange', handleDurationChange)

    // Set initial volume
    video.volume = volume

    // Clean up
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('durationchange', handleDurationChange)
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
    const newVolume = value[0] / 100
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
    if (!videoRef.current || !duration) return
    const newTime = (value[0] / 100) * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    setProgress(value[0])
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
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00"
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
      if (isMountedRef.current) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleEnded = () => {
    setIsPlaying(false)
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
        onPlay={handlePlay}
        onEnded={handleEnded}
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
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
