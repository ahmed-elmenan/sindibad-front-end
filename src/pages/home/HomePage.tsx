import { useEffect, useState } from "react";
import { getPopularCourses } from "@/services/course.service";
import type { Course } from "@/types/Course";
import SindiBadLoading from "@/components/SindiBadLoading";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/home/Footer";
import PartnersSection from "@/components/home/PartnersSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import TeamSection from "@/components/home/TeamSection";
import CourseSection from "@/components/home/CourseSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch courses
    getPopularCourses().then(setCourses);

    // Set a timeout to simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Clean up the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Show loading component while loading
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

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}
