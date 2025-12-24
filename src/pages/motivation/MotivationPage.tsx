"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import Lottie from "lottie-react"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

// Import Lottie animations
import rocket from '@/assets/lottie/Startup.json'
import book from '@/assets/lottie/Books.json'
import brain from '@/assets/lottie/Meditating Brain.json'
import trophy from '@/assets/lottie/Trophy.json'
import video from '@/assets/lottie/Play button.json'
import knowledge from '@/assets/lottie/One Book.json'
import confetti from '@/assets/lottie/Confetti.json'

const lottieAnimations = {
  rocket: {
    animationData: rocket,
    loop: true,
    autoplay: true,
  },
  video: {
    animationData: video,
    loop: true,
    autoplay: true,
  },
  book: {
    animationData: book,
    loop: true,
    autoplay: true,
  },
  knowledge: {
    animationData: knowledge,
    loop: true,
    autoplay: true,
  },
  brain: {
    animationData: brain,
    loop: true,
    autoplay: true,
  },
  trophy: {
    animationData: trophy,
    loop: true,
    autoplay: true,
  },
  confetti: {
    animationData: confetti,
    loop: true,
    autoplay: true,
  },

}

const AnimatedIcon = ({
  animation,
  size = 48,
  className = "",
  style = {},
}: {
  animation: keyof typeof lottieAnimations
  size?: number
  className?: string
  fallbackEmoji?: string
  style?: React.CSSProperties
}) => {
  return (
    <div className={`${className} flex items-center justify-center`} style={{ width: size, height: size, ...style }}>
      <div className="w-full h-full">
        <Lottie
          animationData={lottieAnimations[animation].animationData}
          loop={lottieAnimations[animation].loop}
          autoplay={lottieAnimations[animation].autoplay}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}

import '../../styles/motivation.css';

export default function AdvancedEducationalRace() {
  const [currentSection, setCurrentSection] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)
  const [flippedCard, setFlippedCard] = useState<number | null>(null)
  const [selectedTips, setSelectedTips] = useState<{ [key: number]: string }>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particleIdRef = useRef(0)
  const lastScrollTime = useRef(0)
  const lastMouseTime = useRef(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const raceSteps = useMemo(
    () => [
      {
        title: "Départ",
        icon: "rocket" as keyof typeof lottieAnimations,
        gradient: "from-emerald-400 via-teal-500 to-cyan-600",
        description: "Lance-toi dans l'aventure !",
        bgPattern: "🌟",
        color: "#10b981",
        shadowColor: "rgba(16, 185, 129, 0.4)",
        fallbackEmoji: "🚀",
        tips: [
          "💡 Commence par regarder la vidéo d'introduction pour bien comprendre le sujet !",
          "🎯 Fixe-toi un objectif clair avant de commencer ton apprentissage.",
          "⏰ Prends ton temps, l'apprentissage n'est pas une course !",
          "📝 Prépare un carnet pour noter tes découvertes importantes.",
          "🌟 Chaque expert était un débutant un jour. Tu peux le faire !",
        ],
      },
      {
        title: "Vidéos",
        icon: "video",
        gradient: "from-blue-400 via-indigo-500 to-purple-600",
        description: "Découvre en regardant",
        bgPattern: "📺",
        color: "#3b82f6",
        shadowColor: "rgba(59, 130, 246, 0.4)",
        fallbackEmoji: "🎬",
        tips: [
          "👀 Regarde activement : pause et prends des notes sur les points importants !",
          "🔄 N'hésite pas à revoir les passages difficiles plusieurs fois.",
          "❓ Note tes questions pendant le visionnage pour les poser plus tard.",
          "🎧 Utilise des écouteurs pour une meilleure concentration.",
          "📱 Évite les distractions : mets ton téléphone en mode silencieux !",
        ],
      },
      {
        title: "Leçons",
        icon: "knowledge",
        gradient: "from-purple-400 via-pink-500 to-rose-600",
        description: "Apprends étape par étape",
        bgPattern: "✏️",
        color: "#8b5cf6",
        shadowColor: "rgba(139, 92, 246, 0.4)",
        fallbackEmoji: "📚",
        tips: [
          "📖 Lis chaque leçon attentivement, sans te presser.",
          "🔍 Cherche des exemples concrets pour mieux comprendre les concepts.",
          "💭 Fais des liens avec ce que tu connais déjà.",
          "✍️ Résume chaque leçon avec tes propres mots.",
          "🤝 Discute des concepts avec d'autres apprenants si possible !",
        ],
      },
      {
        title: "Chapitres",
        icon: "book",
        gradient: "from-orange-400 via-red-500 to-pink-600",
        description: "Explore plus profondément",
        bgPattern: "📝",
        color: "#f97316",
        shadowColor: "rgba(249, 115, 22, 0.4)",
        fallbackEmoji: "📖",
        tips: [
          "🔬 Approfondis tes connaissances avec des exemples pratiques.",
          "🧩 Connecte les différents chapitres entre eux pour voir le grand tableau.",
          "💡 Crée tes propres exemples pour tester ta compréhension.",
          "📊 Utilise des schémas ou des cartes mentales pour organiser tes idées.",
          "🎯 Concentre-toi sur les concepts clés de chaque chapitre.",
        ],
      },
      {
        title: "Quiz",
        icon: "brain",
        gradient: "from-amber-400 via-orange-500 to-red-600",
        description: "Teste tes super-pouvoirs !",
        bgPattern: "⚡",
        color: "#f59e0b",
        shadowColor: "rgba(245, 158, 11, 0.4)",
        fallbackEmoji: "🧠",
        tips: [
          "🧠 Les erreurs sont tes amies : elles t'aident à apprendre !",
          "🔄 Refais les quiz jusqu'à obtenir un score parfait.",
          "📚 Retourne aux leçons si tu as des difficultés sur certaines questions.",
          "⏱️ Prends ton temps pour bien lire chaque question.",
          "🎉 Célèbre tes réussites, même les petites victoires comptent !",
        ],
      },
      {
        title: "Certificat",
        icon: "trophy",
        gradient: "from-yellow-400 via-amber-500 to-orange-600",
        description: "Champion, tu as réussi !",
        bgPattern: "🎉",
        color: "#eab308",
        shadowColor: "rgba(234, 179, 8, 0.4)",
        fallbackEmoji: "🏆",
        tips: [
          "🏆 Félicitations ! Tu as terminé ton parcours d'apprentissage !",
          "📜 Ton certificat prouve ton engagement et ta persévérance.",
          "🌟 Partage ta réussite avec tes proches, tu peux être fier de toi !",
          "🚀 Utilise tes nouvelles compétences dans tes projets futurs.",
          "📈 Continue à apprendre, c'est un voyage qui ne s'arrête jamais !",
        ],
      },
    ],
    [],
  )

  const handleCardClick = useCallback(
    (index: number) => {
      if (flippedCard === index) {
        // If clicking the same card, just flip it back
        setFlippedCard(null)
      } else {
        // If flipping to a new card, select a random tip
        const tips = raceSteps[index].tips
        const randomTip = tips[Math.floor(Math.random() * tips.length)]
        setSelectedTips((prev) => ({ ...prev, [index]: randomTip }))
        setFlippedCard(index)
      }
    },
    [flippedCard, raceSteps],
  )

  const createParticle = useCallback((x: number, y: number, color: string) => {
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: (Math.random() - 0.5) * 4, // Reduced velocity for smoother animation
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      maxLife: Math.random() * 60 + 30, // Reduced particle lifetime
      color,
      size: Math.random() * 3 + 1, // Smaller particles
    }
  }, [])

  const animateParticles = useCallback(() => {
    setParticles((prev) => {
      const updated = prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
          life: particle.life - 1 / particle.maxLife,
        }))
        .filter((particle) => particle.life > 0)

      if (Math.random() < 0.2 && updated.length < 20) {
        const step = raceSteps[currentSection]
        const colors = [step?.color || "#3b82f6", "#ffffff", "#fbbf24"]
        updated.push(
          createParticle(
            mousePosition.x + (Math.random() - 0.5) * 80,
            mousePosition.y + (Math.random() - 0.5) * 80,
            colors[Math.floor(Math.random() * colors.length)],
          ),
        )
      }

      return updated
    })
  }, [mousePosition, currentSection, createParticle, raceSteps])

  // ... existing useEffect code ...

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      if (typeof window !== "undefined") {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    resizeCanvas()

    if (typeof window !== "undefined") {
      window.addEventListener("resize", resizeCanvas)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", resizeCanvas)
      }
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color
        ctx.shadowBlur = 8
        ctx.shadowColor = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      requestAnimationFrame(render)
    }

    render()
  }, [particles, isClient])

  useEffect(() => {
    if (!isClient) return

    const animate = () => {
      animateParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animateParticles, isClient])

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      const now = Date.now()
      if (now - lastScrollTime.current < 16) return // Throttle to ~60fps
      lastScrollTime.current = now

      if (typeof window === "undefined") return

      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      // const totalHeight = document.documentElement.scrollHeight - windowHeight
      // const progress = Math.min(scrollPosition / totalHeight, 1)

      // setScrollProgress(progress)

      const section = Math.floor(scrollPosition / (windowHeight * 0.7))
      setCurrentSection(Math.min(section, raceSteps.length - 1))
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMouseTime.current < 32) return // Throttle to ~30fps
      lastMouseTime.current = now

      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true })
      window.addEventListener("mousemove", handleMouseMove, { passive: true })
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll)
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [raceSteps.length, isClient])

  if (!isClient) {
    return (
      <div className="from-slate-900 via-purple-900 to-slate-900 min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-center">
            <div className="mb-4 flex justify-center">
              <AnimatedIcon animation="rocket" size={64} fallbackEmoji="🚀" />
            </div>
            <div className="text-xl font-bold">Chargement de l'aventure...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" style={{ mixBlendMode: "multiply" }} />

      <div className="fixed inset-0 opacity-30">
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 30%, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative race-track" style={{ perspective: "1000px" }}>
        {raceSteps.map((step, index) => (
                    <section key={index} className="h-[700px] py-8 flex items-center justify-center relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full">
              <div
                className="w-full h-full rounded-full relative overflow-hidden bg-gray-100"
                style={{
                  background: `linear-gradient(to bottom, ${step.color}10, ${step.color}30)`,
                  boxShadow: `0 0 20px ${step.shadowColor}30, inset 0 0 15px rgba(255,255,255,0.5)`,
                }}
              >
                <div
                  className="w-full h-full rounded-full transition-all duration-2000 ease-out"
                  style={{
                    height: currentSection >= index ? "100%" : "0%",
                    background: `linear-gradient(to bottom, ${step.color}60, ${step.color}90)`,
                    boxShadow: `0 0 20px ${step.shadowColor}40`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent rounded-full animate-energy-pulse"></div>

                  <div
                    className="absolute inset-0 rounded-full opacity-70"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, ${step.color}90 50%, transparent 100%)`,
                      animation: "energy-flow 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center w-full h-full">
              {index === raceSteps.length - 1 ? (
                // Certificate card - centered
                <div className="w-full flex items-center justify-center py-8">
                  <div className="w-[500px] transform transition-all duration-1000 hover:scale-105">
                    <div
                      className="flip-card cursor-pointer"
                      onClick={() => handleCardClick(index)}
                      style={{ perspective: "1000px" }}
                    >
                      <div className={`flip-card-inner ${flippedCard === index ? "flipped" : ""}`}>
                        {/* Front of card */}
                        <div className="flip-card-front">
                          <div
                            className={`relative rounded-2xl p-8 shadow-lg border border-gray-200 backdrop-blur-xl overflow-hidden transform-gpu h-96 ${
                              currentSection >= index
                                ? "animate-morph-in-left opacity-100 translate-x-0 rotate-0"
                                : "translate-y-[100px] opacity-0 scale-90"
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${step.color}10, ${step.color}20)`,
                              boxShadow: `0 15px 30px ${step.shadowColor}40, 0 0 0 1px rgba(0,0,0,0.05)`,
                            }}
                          >
                            <div className="absolute inset-0 opacity-15">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute text-4xl animate-float-gentle"
                                  style={{
                                    left: `${Math.random() * 80}%`,
                                    top: `${Math.random() * 80}%`,
                                    animationDelay: `${i * 0.5}s`,
                                  }}
                                >
                                  {step.bgPattern}
                                </div>
                              ))}
                            </div>

                            <div className="text-center relative z-10">
                              <div className="mb-6 flex justify-center">
                                <AnimatedIcon
                                  animation={step.icon as keyof typeof lottieAnimations}
                                  size={100}
                                  fallbackEmoji={step.fallbackEmoji}
                                  className="filter drop-shadow-2xl"
                                  style={{ textShadow: `0 0 30px ${step.shadowColor}` }}
                                />
                              </div>
                              <h2 className="text-4xl font-black text-gray-800 mb-4 drop-shadow-sm">{step.title}</h2>
                              <p className="text-gray-700 text-xl font-medium leading-relaxed">{step.description}</p>
                              <div className="mt-4 text-gray-500 text-sm">Clique pour voir un conseil !</div>

                              <div className="mt-6 flex justify-center">
                                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full transition-all duration-1000"
                                    style={{ width: currentSection >= index ? "100%" : "0%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Back of card */}
                        <div className="flip-card-back">
                          <div
                            className="relative rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden h-96 flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${step.color}30, ${step.color}50)`,
                              boxShadow: `0 25px 50px ${step.shadowColor}, 0 0 0 1px rgba(255,255,255,0.1)`,
                            }}
                          >
                            <div className="text-center relative z-10 max-w-md">
                              <div className="mb-4 flex justify-center">
                                <div className="text-5xl filter drop-shadow-lg">💡</div>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-800 mb-4">Conseil du Champion</h3>
                              <p className="text-gray-700 text-lg font-medium leading-relaxed mb-4">
                                {selectedTips[index] || raceSteps[index].tips[0]}
                              </p>
                              <div className="text-gray-500 text-sm">Clique à nouveau pour revenir</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular cards - dramatic zigzag alternating left/right
                <>
                  {index % 2 === 0 ? (
                    // Left side card - positioned far left
                    <>
                      <div className="w-[500px] pr-6 pb-8 transform transition-all duration-1000 hover:scale-105 flex items-center">
                        <div
                          className="flip-card cursor-pointer w-full"
                          onClick={() => handleCardClick(index)}
                          style={{ perspective: "1000px" }}
                        >
                          <div className={`flip-card-inner ${flippedCard === index ? "flipped" : ""}`}>
                            {/* Front of card */}
                            <div className="flip-card-front">
                              <div
                                className={`relative rounded-2xl p-8 shadow-lg border border-gray-200 backdrop-blur-xl overflow-hidden transform-gpu h-[320px] flex items-center justify-center bg-white/95 ${
                                  currentSection >= index
                                    ? "animate-morph-in-left opacity-100 translate-x-0 rotate-0"
                                    : "translate-y-[100px] opacity-0 scale-90"
                                }`}
                                style={{
                                  background: `linear-gradient(135deg, white, ${step.color}10)`,
                                  boxShadow: `0 15px 30px ${step.shadowColor}20, 0 0 0 1px rgba(0,0,0,0.05)`,
                                }}
                              >
                                <div className="absolute inset-0 opacity-25">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="absolute text-3xl animate-float-gentle"
                                      style={{
                                        left: `${Math.random() * 80}%`,
                                        top: `${Math.random() * 80}%`,
                                        animationDelay: `${i * 0.6}s`,
                                      }}
                                    >
                                      {step.bgPattern}
                                    </div>
                                  ))}
                                </div>

                                <div className="text-center relative z-10 max-w-sm">
                                  <h2 className="text-3xl font-black text-gray-800 mb-4 drop-shadow-sm">{step.title}</h2>
                                  <p className="text-gray-700 text-lg font-medium leading-relaxed mb-4">
                                    {step.description}
                                  </p>
                                  <div className="mt-2 text-gray-500 text-sm">Clique pour un conseil !</div>

                                  <div className="mt-6 flex justify-center">
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                                        style={{ width: currentSection >= index ? "100%" : "0%" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Back of card */}
                            <div className="flip-card-back">
                              <div
                                className="relative rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden h-[320px] flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${step.color}30, ${step.color}50)`,
                                  boxShadow: `0 25px 50px ${step.shadowColor}, 0 0 0 1px rgba(255,255,255,0.1)`,
                                }}
                              >
                                <div className="text-center relative z-10 max-w-md">
                                  <div className="mb-4 flex justify-center">
                                    <div className="text-5xl">💡</div>
                                  </div>
                                  <h3 className="text-2xl font-bold text-white mb-4">Conseil Utile</h3>
                                  <p className="text-white/90 text-lg font-medium leading-relaxed mb-4">
                                    {selectedTips[index] || raceSteps[index].tips[0]}
                                  </p>
                                  <div className="text-white/60 text-xs">Clique à nouveau pour revenir</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-4/12 pb-16 flex items-center justify-center">
                        {/* ... existing checkpoint code ... */}
                        <div className="relative z-20">
                          <div
                            className={`w-20 h-20 rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-1000 transform-gpu ${
                              currentSection >= index ? "scale-125 animate-checkpoint-active" : "scale-100"
                            }`}
                            style={{
                              background:
                                currentSection >= index
                                  ? `radial-gradient(circle, ${step.color}, ${step.color}cc)`
                                  : "radial-gradient(circle, #374151, #1f2937)",
                              boxShadow:
                                currentSection >= index
                                  ? `0 0 50px ${step.shadowColor}, 0 0 100px ${step.shadowColor}40`
                                  : "0 8px 25px rgba(0,0,0,0.3)",
                            }}
                          >
                            <AnimatedIcon
                              animation={step.icon as keyof typeof lottieAnimations}
                              size={48}
                              fallbackEmoji={step.fallbackEmoji}
                              className="filter drop-shadow-lg transform transition-all duration-500"
                              style={{
                                transform: currentSection >= index ? "scale(1.3)" : "scale(1)",
                                textShadow: `0 0 20px ${step.shadowColor}`,
                              }}
                            />
                          </div>

                          {currentSection >= index && (
                            <>
                              {[...Array(2)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute inset-0 rounded-full border-2 animate-energy-ring"
                                  style={{
                                    borderColor: `${step.color}${60 - i * 30}`,
                                    animationDelay: `${i * 0.5}s`,
                                    transform: `scale(${1 + i * 0.5})`,
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Right side card - positioned far right
                    <>
                      <div className="w-4/12 pb-16 flex items-center justify-center">
                        {/* ... existing checkpoint code ... */}
                        <div className="relative z-20">
                          <div
                            className={`w-20 h-20 rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-1000 transform-gpu ${
                              currentSection >= index ? "scale-125 animate-checkpoint-active" : "scale-100"
                            }`}
                            style={{
                              background:
                                currentSection >= index
                                  ? `radial-gradient(circle, ${step.color}, ${step.color}cc)`
                                  : "radial-gradient(circle, #374151, #1f2937)",
                              boxShadow:
                                currentSection >= index
                                  ? `0 0 50px ${step.shadowColor}, 0 0 100px ${step.shadowColor}40`
                                  : "0 8px 25px rgba(0,0,0,0.3)",
                            }}
                          >
                            <AnimatedIcon
                              animation={step.icon as keyof typeof lottieAnimations}
                              size={48}
                              fallbackEmoji={step.fallbackEmoji}
                              className="filter drop-shadow-lg transform transition-all duration-500"
                              style={{
                                transform: currentSection >= index ? "scale(1.3)" : "scale(1)",
                                textShadow: `0 0 20px ${step.shadowColor}`,
                              }}
                            />
                          </div>

                          {currentSection >= index && (
                            <>
                              {[...Array(2)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute inset-0 rounded-full border-2 animate-energy-ring"
                                  style={{
                                    borderColor: `${step.color}${60 - i * 30}`,
                                    animationDelay: `${i * 0.5}s`,
                                    transform: `scale(${1 + i * 0.5})`,
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="w-[500px] pl-6 pb-8 transform transition-all duration-1000 hover:scale-105 flex items-center">
                        <div
                          className="flip-card cursor-pointer w-full"
                          onClick={() => handleCardClick(index)}
                          style={{ perspective: "1000px" }}
                        >
                          <div className={`flip-card-inner ${flippedCard === index ? "flipped" : ""}`}>
                            {/* Front of card */}
                            <div className="flip-card-front">
                              <div
                                className={`relative rounded-2xl p-5 shadow-lg border border-gray-200 backdrop-blur-xl overflow-hidden transform-gpu h-[320px] bg-white/90 ${
                                  currentSection >= index
                                    ? "animate-morph-in-right opacity-100 translate-x-0 rotate-0"
                                    : "translate-y-[100px] opacity-0 scale-90"
                                }`}
                                style={{
                                  background: `linear-gradient(135deg, white, ${step.color}10)`,
                                  boxShadow: `0 15px 30px ${step.shadowColor}20, 0 0 0 1px rgba(0,0,0,0.05)`,
                                }}
                              >
                                <div className="absolute inset-0 opacity-15">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="absolute text-3xl animate-float-gentle"
                                      style={{
                                        left: `${Math.random() * 80}%`,
                                        top: `${Math.random() * 80}%`,
                                        animationDelay: `${i * 0.6}s`,
                                      }}
                                    >
                                      {step.bgPattern}
                                    </div>
                                  ))}
                                </div>

                                <div className="text-center relative z-10 flex flex-col justify-center h-full">
                                  <h2 className="text-3xl font-black text-gray-800 mb-6 drop-shadow-sm">{step.title}</h2>
                                  <p className="text-gray-700 text-lg font-medium leading-relaxed mb-6">
                                    {step.description}
                                  </p>
                                  <div className="mt-2 text-gray-500 text-sm">Clique pour un conseil !</div>

                                  <div className="mt-4 flex justify-center">
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                                        style={{ width: currentSection >= index ? "100%" : "0%" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Back of card */}
                            <div className="flip-card-back">
                              <div
                                className="relative rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden h-[320px] flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${step.color}30, ${step.color}50)`,
                                  boxShadow: `0 25px 50px ${step.shadowColor}, 0 0 0 1px rgba(255,255,255,0.1)`,
                                }}
                              >
                                <div className="text-center relative z-10 max-w-md">
                                  <div className="mb-4 flex justify-center">
                                    <div className="text-5xl">💡</div>
                                  </div>
                                  <h3 className="text-2xl font-bold text-white mb-4">Conseil Utile</h3>
                                  <p className="text-white/90 text-lg font-medium leading-relaxed mb-4">
                                    {selectedTips[index] || raceSteps[index].tips[0]}
                                  </p>
                                  <div className="text-white/60 text-xs">Clique à nouveau pour revenir</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ... existing celebration code ... */}
            {index === raceSteps.length - 1 && currentSection >= index && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-celebration-advanced"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${4 + Math.random() * 2}s`,
                    }}
                  >
                    <AnimatedIcon animation="confetti" size={120} fallbackEmoji="🎉" className="scale-150" />
                  </div>
                ))}

                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full animate-firework-${(i % 3) + 1}`}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      background: ["#fbbf24", "#f472b6", "#60a5fa"][i],
                      animationDelay: `${i * 0.7}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ... existing progress bar code ... */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-2xl bg-white/90 border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <AnimatedIcon animation="rocket" size={18} fallbackEmoji="🚀" className="filter drop-shadow" />
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur animate-pulse"></div>
              </div>
              <div>
                <span className="text-xs font-black text-gray-800 drop-shadow">PROGRESSION</span>
                <div className="text-[8px] text-gray-600 font-medium">Aventure éducative</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.round(((currentSection + 1) / raceSteps.length) * 100)}%
              </div>
              <div className="text-gray-600 text-[10px] font-medium">
                Étape {currentSection + 1} sur {raceSteps.length}
              </div>
            </div>
          </div>

          <div className="relative w-full bg-gray-200 rounded-xl h-2 overflow-hidden shadow-inner border border-gray-300">
            <div
              className="absolute top-0 left-0 h-full rounded-xl transition-all duration-2000 ease-out shadow-md"
              style={{
                width: `${((currentSection + 1) / raceSteps.length) * 100}%`,
                background: `linear-gradient(90deg, ${raceSteps[currentSection]?.color || "#3b82f6"}90, ${raceSteps[Math.min(currentSection + 1, raceSteps.length - 1)]?.color || "#8b5cf6"}90)`,
                boxShadow: `0 0 10px ${raceSteps[currentSection]?.shadowColor || "rgba(59, 130, 246, 0.2)"}`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent rounded-xl"></div>
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/50 to-transparent rounded-xl"></div>

              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 w-2 h-2 bg-white rounded-full animate-progress-particle"
                  style={{
                    right: `${i * 30}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
