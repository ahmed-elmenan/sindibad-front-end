import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ModernNavBar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div>
      {/* Modern Navigation Bar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl"></div>
              <span
                className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate("/")}
              >
                SindiBad
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="https://blackhole.sindibadacademy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-muted-foreground hover:text-foreground transition-colors"
              >
                BlackHole
              </a>
              <a
                href="#features"
                className="nav-link text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#courses"
                className="nav-link text-muted-foreground hover:text-foreground transition-colors"
              >
                Courses
              </a>
              <a
                href="#about"
                className="nav-link text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <Button
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground border-0 rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => navigate("/signin")}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary focus:outline-none focus:text-primary transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-border/50"
            >
              <div className="px-6 py-4 space-y-4">
                <a
                  href="https://blackhole.sindibadacademy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 py-2 px-3 rounded-lg hover:translate-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  BlackHole
                </a>
                <a
                  href="#features"
                  className="block text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 py-2 px-3 rounded-lg hover:translate-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#courses"
                  className="block text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 py-2 px-3 rounded-lg hover:translate-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Courses
                </a>
                <a
                  href="#about"
                  className="block text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 py-2 px-3 rounded-lg hover:translate-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => {
                    navigate("/signin");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};


export default ModernNavBar;
