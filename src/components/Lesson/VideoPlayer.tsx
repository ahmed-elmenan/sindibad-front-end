"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import ErrorState from "@/components/ui/ErrorState"
import { useTranslation } from "react-i18next"

interface VideoPlayerProps {
  videoUrl: string | null
  title?: string
  onProgress?: (progress: number) => void
  lessonLoading: boolean
  onVideoWatchTime?: (seconds: number) => void  // Callback optionnel pour le tracking précis
}

export function VideoPlayer({ videoUrl, onProgress, lessonLoading, onVideoWatchTime }: VideoPlayerProps) {
  const {t}  = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 📹 Tracking précis du temps de visionnage
  const lastPositionRef = useRef(0)
  const videoWatchTimeRef = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onProgress?.((video.currentTime / video.duration) * 100)
      
      // 📹 Tracking précis : compter uniquement le temps réellement regardé
      if (onVideoWatchTime) {
        const currentPos = video.currentTime
        const timeDiff = Math.abs(currentPos - lastPositionRef.current)
        
        // Si la différence est < 2 secondes = lecture normale (pas de skip)
        if (timeDiff < 2 && timeDiff > 0) {
          videoWatchTimeRef.current += timeDiff
          
          // Envoyer le temps toutes les 30 secondes de visionnage réel
          if (videoWatchTimeRef.current >= 30) {
            onVideoWatchTime(videoWatchTimeRef.current)
            videoWatchTimeRef.current = 0
          }
        }
        
        lastPositionRef.current = currentPos
      }
    }

    const handleError = () => {
      setError("Erreur lors du chargement de la vidéo")
      setIsLoading(false)
    }

    // Protection contre le clic droit uniquement sur la vidéo
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Protection contre la sélection de texte
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Protection contre le glisser-déposer
    const handleDragStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("error", handleError)
    video.addEventListener("contextmenu", handleContextMenu)
    video.addEventListener("selectstart", handleSelectStart)
    video.addEventListener("dragstart", handleDragStart)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("error", handleError)
      video.removeEventListener("contextmenu", handleContextMenu)
      video.removeEventListener("selectstart", handleSelectStart)
      video.removeEventListener("dragstart", handleDragStart)
    }
  }, [onProgress])

  // Keyboard protection only when container is focused
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        e.preventDefault()
        return false
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null)
          setIsLoading(true)
        }}
      />
    )
  }

  // Afficher un message si aucune vidéo n'est disponible
  if (!videoUrl && !lessonLoading) {
    return (
      <Card className="relative overflow-hidden bg-gray-100 max-h-[480px] rounded-none flex items-center justify-center aspect-[16/7]">
        <div className="text-center text-gray-500">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{t("videoPlayer.noVideoTitle", "Aucune vidéo disponible")}</p>
          <p className="text-sm">{t("videoPlayer.noVideoDescription", "La vidéo n'a pas encore été ajoutée à cette leçon.")}</p>
        </div>
      </Card>
    )
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Card className="relative overflow-hidden bg-black max-h-[480px] rounded-none">
        <video
          ref={videoRef}
          className="w-full aspect-[16/7] max-h-[480px]"
          src={videoUrl || undefined}
          onClick={togglePlay}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        />

        {/* Overlay transparent pour bloquer les interactions directes avec la vidéo */}
        <div
          className="absolute inset-0 z-10"
          onClick={togglePlay}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ backgroundColor: 'transparent' }}
        />

        {/* Afficher l'icône Pause au centre si la vidéo est en pause et chargée */}
        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="flex items-center justify-center rounded-full bg-gray-700 bg-opacity-90 w-28 h-28">
              <Pause className="w-20 h-20 text-white/80 drop-shadow-lg" />
            </span>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-30">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex-1">
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <div className="w-20">
                <Slider value={[isMuted ? 0 : volume * 100]} onValueChange={handleVolumeChange} max={100} step={1} />
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        /* CSS pour désactiver la sélection et le glisser-déposer */
        video::-webkit-media-controls-download-button {
          display: none !important;
        }
        
        video::-webkit-media-controls-fullscreen-button {
          display: none !important;
        }
        
        video::-webkit-media-controls {
          display: none !important;
        }
        
        /* Désactiver le menu contextuel sur tous les navigateurs */
        video::context-menu {
          display: none !important;
        }
      `}</style>
    </div>
  )
}