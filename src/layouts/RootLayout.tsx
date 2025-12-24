import { Outlet } from "react-router-dom";
import { NavBar } from "@/components/form/NavBar";
import { useAuth } from "@/hooks/useAuth";
import SindiBadLoading from "@/components/SindiBadLoading";

export default function RootLayout() {
  const { isLoading } = useAuth();

  return (
    <>
      {isLoading ? (
        <SindiBadLoading />
      ) : (
        <div className="min-h-screen bg-background">
          <NavBar />
          <Outlet />
        </div>
      )}
    </>
  );
}
