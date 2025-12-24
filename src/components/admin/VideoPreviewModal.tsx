import React, { useState, useRef, useEffect } from "react";
import { X, AlertCircle, Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  videoTitle?: string;
}

type VideoError = {
  type: "loading" | "access" | "playback" | "format" | "network";
  message: string;
};

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoTitle = "Aperçu vidéo",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<VideoError | null>(null);
  const [volume, setVolume] = useState(1);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Pause video if playing
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setError(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, []);

  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    setIsLoading(false);
    
    if (!error) {
      setError({
        type: "playback",
        message: "Une erreur inconnue s'est produite lors de la lecture de la vidéo.",
      });
      return;
    }

    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        setError({
          type: "loading",
          message: "Le chargement de la vidéo a été interrompu.",
        });
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        setError({
          type: "network",
          message: "Une erreur réseau s'est produite lors du chargement de la vidéo.",
        });
        break;
      case MediaError.MEDIA_ERR_DECODE:
        setError({
          type: "format",
          message: "La vidéo ne peut pas être décodée. Le format pourrait être corrompu.",
        });
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        setError({
          type: "access",
          message: "La source vidéo n'est pas supportée ou accessible. Vérifiez les permissions d'accès.",
        });
        break;
      default:
        setError({
          type: "playback",
          message: "Impossible de lire la vidéo.",
        });
    }
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Erreur lors de la lecture:", err);
      setError({
        type: "playback",
        message: "Impossible de lire la vidéo. Réessayez.",
      });
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Format time
  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{videoTitle}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative bg-black aspect-video">
          {/* Loading State */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <p className="text-white text-sm">Chargement de la vidéo...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 p-6">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="mt-2">
                  <p className="font-semibold mb-2">
                    {error.type === "access" && "Accès refusé"}
                    {error.type === "network" && "Erreur réseau"}
                    {error.type === "format" && "Format non supporté"}
                    {error.type === "playback" && "Erreur de lecture"}
                    {error.type === "loading" && "Erreur de chargement"}
                  </p>
                  <p className="text-sm">{error.message}</p>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Video Element */}
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onClick={togglePlayPause}
            />
          )}

          {/* Video Controls */}
          {!error && !isLoading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Play/Pause & Volume */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                  />

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;
