import { Outlet } from "react-router-dom";
import ModernNavBar from "@/components/form/ModernNavBar";
import { useAuth } from "@/hooks/useAuth";
import SindiBadLoading from "@/components/SindiBadLoading";
import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout() {
  const { isLoading } = useAuth();

  return (
    <>
      <ScrollToTop />
      {isLoading ? (
        <SindiBadLoading />
      ) : (
        <div className="min-h-screen bg-background pt-20">
          <ModernNavBar />
          <Outlet />
        </div>
      )}
    </>
  );
}
