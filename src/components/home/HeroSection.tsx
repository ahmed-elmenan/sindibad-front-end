import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReactPlayer from "react-player";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const [showDemo, setShowDemo] = useState<boolean>(false);

  return (
    <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background for desktop, Image for mobile */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="hidden md:block absolute top-0 left-0 w-full h-full object-cover scale-105"
        poster="/hero-image.jpg"
        style={{
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        <source
          src="https://sindibad-elearning-assets.s3.eu-north-1.amazonaws.com/HomePageVideo/hero-bg.mp4"
          type="video/mp4"
        />
      </video>
      
      {/* Static background image for mobile devices */}
      <div 
        className="block md:hidden absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-image.jpg')",
        }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-muted/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-transparent">
              Transform Your Future with
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Premium Learning
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners mastering new skills with our interactive
            courses, expert instructors, and cutting-edge technology.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground border-0 rounded-xl px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
            onClick={() => {
              onGetStarted();
            }}
          >
            Start Learning Today
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 text-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            onClick={() => {
              setShowDemo(true);
            }}
          >
            Watch Demo
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V3a1 1 0 011-1h1a1 1 0 011 1v3M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </Button>
        </motion.div>
      </div>

      {/* Modal pour la vidéo complète */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-full max-w-4xl aspect-video">
              <ReactPlayer
                src="https://sindibad-elearning-assets.s3.eu-north-1.amazonaws.com/Courses-Pictures/main-video.mp4"
                playing
                controls
                muted
                width="100%"
                height="100%"
              />
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-3 right-3 text-white text-2xl hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
