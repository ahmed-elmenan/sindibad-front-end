"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SindiBadLoadingProps {
  duration?: number; // Durée en millisecondes (par défaut 3000ms)
}

const SindiBadLoading: React.FC<SindiBadLoadingProps> = ({ duration = 3000 }) => {
  const [isComplete, setIsComplete] = useState(false);
  const letters = ["S", "i", "n", "d", "i", "b", "a", "d"];

  // Couleurs vives pour chaque lettre
  const letterColors = [
    "from-blue-400 to-blue-600", // S - Bleu
    "from-pink-400 to-pink-600", // i - Rose
    "from-yellow-400 to-yellow-600", // n - Jaune
    "from-green-400 to-green-600", // d - Vert
    "from-purple-400 to-purple-600", // i - Violet
    "from-orange-400 to-orange-600", // b - Orange
    "from-red-400 to-red-600", // a - Rouge
    "from-teal-400 to-teal-600", // d - Cyan
  ];

  // Animation des lettres qui apparaissent une par une
  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.5,
      rotate: -10,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        type: "spring" as const,
        bounce: 0.6,
      },
    }),
  };

  // Animation de pulsation continue
  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut" as const,
      },
    },
  };

  // Formes animées en arrière-plan
  const FloatingShape = ({
    delay,
    duration: shapeDuration,
    children,
    className,
  }: {
    delay: number;
    duration: number;
    children: React.ReactNode;
    className: string;
  }) => (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        rotate: [0, 360],
      }}
      transition={{
        duration: shapeDuration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut" as const,
      }}
    >
      {children}
    </motion.div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Formes animées en arrière-plan */}
      <FloatingShape delay={0} duration={4} className="top-20 left-20 text-blue-300">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-200 to-blue-400 opacity-60" />
      </FloatingShape>

      <FloatingShape delay={1} duration={5} className="top-32 right-32 text-pink-300">
        <div className="w-6 h-6 bg-gradient-to-r from-pink-200 to-pink-400 opacity-60 transform rotate-45" />
      </FloatingShape>

      <FloatingShape delay={2} duration={3.5} className="bottom-32 left-32 text-yellow-300">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-400 opacity-60" />
      </FloatingShape>

      <FloatingShape delay={0.5} duration={4.5} className="bottom-20 right-20 text-green-300">
        <div className="w-7 h-7 bg-gradient-to-r from-green-200 to-green-400 opacity-60 rounded-full" />
      </FloatingShape>

      {/* Étoiles scintillantes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400 text-2xl"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut" as const,
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Conteneur principal */}
      <div className="text-center">
        {/* Lettres Sindibad */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {letters.map((letter, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <motion.span
                variants={pulseVariants}
                animate="pulse"
                className={`
                  text-8xl font-black bg-gradient-to-br ${letterColors[index]}
                  bg-clip-text text-transparent drop-shadow-lg
                  font-sans tracking-tight
                `}
                style={{
                  fontFamily: "Comic Sans MS, cursive, system-ui",
                  textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                {letter}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Texte de chargement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-center"
        >
          <motion.p
            className="text-2xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut" as const,
            }}
          >
            Chargement en cours...
          </motion.p>

          {/* Barre de progression ludique */}
          <div className="w-64 h-3 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2.5,
                ease: "easeInOut" as const,
                delay: 0.5,
              }}
            />
          </div>
        </motion.div>

        {/* Message de fin */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <motion.p
              className="text-xl font-semibold text-green-600"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                repeat: 2,
              }}
            >
              🎉 Prêt à Apprendre ! 🎉
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SindiBadLoading;
