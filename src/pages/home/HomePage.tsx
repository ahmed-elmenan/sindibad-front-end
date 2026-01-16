import { useEffect, useState } from "react";
import { getPopularCourses } from "@/services/course.service";
import type { Course } from "@/types/Course";
import { useNavigate, useLocation } from "react-router-dom";
import SindiBadLoading from "@/components/SindiBadLoading";
import Footer from "@/components/home/Footer";
import PartnersSection from "@/components/home/PartnersSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import TeamSection from "@/components/home/TeamSection";
import CourseSection from "@/components/home/CourseSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    // Vérifier si c'est la première visite de la session
    const hasVisitedHome = sessionStorage.getItem("hasVisitedHome");
    return hasVisitedHome === null; // Afficher le loading seulement si c'est null (jamais visité)
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch courses
    getPopularCourses().then(setCourses);

    // Si c'est la première visite, afficher l'animation puis marquer comme visité
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasVisitedHome", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Gérer le scroll vers la section après le chargement
  useEffect(() => {
    if (!isLoading && location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [isLoading, location.hash]);

  // Afficher l'animation de chargement lors de la première visite
  if (isLoading) {
    return <SindiBadLoading />;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Hero Section with Video Background */}
      <HeroSection onGetStarted={() => navigate("/signup")} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Courses Section - Premium Design */}
      <CourseSection courses={courses} />

      {/* Our Team Section */}
      <TeamSection />

      {/* Modern Statistics Section */}
      <StatisticsSection />

      {/* Partners Section */}
      <PartnersSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}
