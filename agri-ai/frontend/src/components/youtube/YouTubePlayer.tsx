import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Play, RefreshCw } from 'lucide-react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

// Singleton promise for loading the official YouTube IFrame API script
let youTubeApiLoadingPromise: Promise<void> | null = null

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
    return Promise.resolve()
  }

  if (youTubeApiLoadingPromise) {
    return youTubeApiLoadingPromise
  }

  youTubeApiLoadingPromise = new Promise<void>((resolve, reject) => {
    // If script tag already in DOM
    const existingScript = document.getElementById('youtube-iframe-api')
    if (existingScript && window.YT && window.YT.Player) {
      resolve()
      return
    }

    const previousOnReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady()
      resolve()
    }

    const tag = document.createElement('script')
    tag.id = 'youtube-iframe-api'
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    tag.onerror = () => {
      youTubeApiLoadingPromise = null
      reject(new Error('Failed to load YouTube IFrame Player API'))
    }

    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    } else {
      document.head.appendChild(tag)
    }
  })

  return youTubeApiLoadingPromise
}

export interface YouTubePlayerProps {
  videoId: string
  title?: string
  onVideoEnded?: () => void
  onPlay?: () => void
  onPause?: () => void
  className?: string
}

export function YouTubePlayer({
  videoId,
  title = 'Farm Tutorial Video',
  onVideoEnded,
  onPlay,
  onPause,
  className = '',
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Clean video ID to avoid URL prefixes
  const cleanVideoId = useMemoVideoId(videoId)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setHasError(false)

    loadYouTubeIframeApi()
      .then(() => {
        if (isCancelled || !containerRef.current) return

        // If player already exists, load the new video ID cleanly
        if (playerRef.current && typeof playerRef.current.cueVideoById === 'function') {
          try {
            setHasError(false)
            playerRef.current.cueVideoById(cleanVideoId)
            setIsLoading(false)
            return
          } catch (e) {
            // Re-create player if error
          }
        }

        // Clean previous element inside container
        containerRef.current.innerHTML = ''
        const placeholderDiv = document.createElement('div')
        containerRef.current.appendChild(placeholderDiv)

        playerRef.current = new window.YT.Player(placeholderDiv, {
          videoId: cleanVideoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              if (!isCancelled) {
                setIsLoading(false)
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return

              // YT.PlayerState.ENDED is 0
              if (event.data === window.YT.PlayerState.ENDED) {
                if (onVideoEnded) {
                  onVideoEnded()
                }
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                if (onPlay) onPlay()
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                if (onPause) onPause()
              }
            },
            onError: (err: any) => {
              if (!isCancelled) {
                console.warn('YouTube Player error:', err)
                setHasError(true)
                setErrorMessage('Tutorial video is currently unavailable or restricted.')
                setIsLoading(false)
              }
            },
          },
        })
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('YouTube API load failure:', err)
          setHasError(true)
          setErrorMessage('Unable to connect to YouTube IFrame API. Check network connectivity.')
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy()
        } catch {
          // ignore cleanup issues
        }
        playerRef.current = null
      }
    }
  }, [cleanVideoId])

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 shadow-md border border-neutral-800 ${className}`}
    >
      {/* Target Container for YT IFrame */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/80 text-white z-10 space-y-2">
          <RefreshCw className="h-7 w-7 animate-spin text-emerald-500" />
          <p className="text-xs font-semibold text-neutral-300">Loading YouTube Tutorial…</p>
        </div>
      )}

      {/* Error Fallback (Friendly message, doesn't crash Farm Action Plan) */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/95 text-white p-6 text-center z-20 space-y-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-neutral-100">Tutorial Video Unavailable</h4>
          <p className="text-xs text-neutral-400 max-w-sm">
            {errorMessage || 'The YouTube tutorial is temporarily unavailable. You can still complete the checklist below.'}
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${cleanVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline pt-1"
          >
            <Play className="h-3 w-3" />
            <span>Open in YouTube (fallback)</span>
          </a>
        </div>
      )}
    </div>
  )
}

function useMemoVideoId(raw: string): string {
  if (!raw) return '8VbKqI9s8Fw'
  // If user pasted a full URL by accident, parse ID
  if (raw.includes('v=')) {
    return raw.split('v=')[1]?.split('&')[0] || raw
  }
  if (raw.includes('youtu.be/')) {
    return raw.split('youtu.be/')[1]?.split('?')[0] || raw
  }
  return raw.trim()
}
