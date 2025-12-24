"use client"

import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

const WaitingAdminMessage = () => {
    const {t} = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-white/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Emoji animé qui tourne */}
        <motion.div
          className="text-6xl mb-6"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          ⏳
        </motion.div>

        {/* Titre principal avec animation de rebond */}
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-4 text-balance"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {t("waiting")} 🤖
        </motion.h2>

        {/* Message principal avec animation de "respiration" */}
        <motion.p
          className="text-gray-600 text-lg leading-relaxed mb-6 text-pretty"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {t("waitingAdminMessage")}
        </motion.p>

        {/* Points de chargement animés */}
        <div className="flex justify-center space-x-2 mb-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-indigo-400 rounded-full"
              animate={{
                y: [0, -12, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Emoji secondaire qui fait un petit bounce */}
        <motion.div
          className="text-2xl"
          animate={{
            y: [0, -4, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          🙃
        </motion.div>

        {/* Barre de progression infinie */}
        <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ width: "30%" }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default WaitingAdminMessage
