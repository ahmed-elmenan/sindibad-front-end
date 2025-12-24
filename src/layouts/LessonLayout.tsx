import { Outlet } from "react-router-dom";
import { NavBar } from "@/components/form/NavBar";
import ScrollToTop from "@/components/ScrollToTop";


export default function LessonLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <NavBar />
      
      <main className="mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
