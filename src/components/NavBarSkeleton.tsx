"use client";
import { motion } from "framer-motion";

const NavBarSkeleton = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side - Logo skeleton */}
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          {/* Logo skeleton */}
          <motion.div
            className="w-8 h-8 bg-gray-200 rounded-md"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut" as const,
            }}
          />

          {/* Navigation links skeleton */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${60 + Math.random() * 40}px` }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" as const,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right side - Auth buttons skeleton */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Language switcher skeleton */}
          <motion.div
            className="w-8 h-8 bg-gray-200 rounded"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              delay: 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut" as const,
            }}
          />

          {/* Auth buttons skeleton */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {/* Avatar skeleton */}
            <motion.div
              className="flex items-center gap-2 px-2"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                delay: 0.3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut" as const,
              }}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded" style={{ width: "80px" }} />
            </motion.div>
          </div>

          {/* Mobile menu skeleton */}
          <motion.div
            className="md:hidden w-8 h-8 bg-gray-200 rounded"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              delay: 0.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut" as const,
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default NavBarSkeleton;
