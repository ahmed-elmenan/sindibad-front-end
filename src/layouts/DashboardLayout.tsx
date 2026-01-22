import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { getSummaryProfile } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import {
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function DashboardLayout() {
  const { setUser } = useAuth();
  const { data: profileData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["summaryProfile"],
    queryFn: getSummaryProfile,
    staleTime: 0, // Ne pas garder les données en cache
    refetchOnMount: "always", // Toujours refetch au montage
    gcTime: 0, // Ne pas garder les données en cache après unmount
  });

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Update user context when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setUser({
        id: profileData.id,
        name: profileData.fullName || profileData.userName,
        email: profileData.email,
        role: profileData.role,
        avatar: profileData.avatar,
      });
    }
  }, [profileData, setUser]);

  const sidebarElementsForOrganisation = {
    navMain: [
      {
        title: "dashboard",
        url: "/organisation/dashboard",
        icon: IconDashboard,
      },
      {
        title: "courses",
        url: "/organisation/courses",
        icon: IconListDetails,
      },
      {
        title: "myStudents",
        url: "/organisation/students",
        icon: IconUsers,
      },
    ],
    navClouds: [
      {
        title: "Capture",
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
    ],
  };

  const sidebarElementsForAdmin = {
    navMain: [
      {
        title: "dashboard",
        url: "/admin/dashboard",
        icon: IconDashboard,
      },
      {
        title: "courses",
        url: "/admin/courses",
        icon: IconListDetails,
      },
      {
        title: "students",
        url: "/admin/students",
        icon: IconUsers,
      },
      {
        title: "organizations",
        url: "/admin/organizations",
        icon: IconUsers,
      },
    ],
    navSecondary: [
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
    ],
  };

  const sidebarElementsForSuperAdmin = {
    navMain: [
      {
        title: "dashboard",
        url: "/admin/dashboard",
        icon: IconDashboard,
      },
      {
        title: "courses",
        url: "/admin/courses",
        icon: IconListDetails,
      },
      {
        title: "students",
        url: "/admin/students",
        icon: IconUsers,
      },
      {
        title: "organizations",
        url: "/admin/organizations",
        icon: IconUsers,
      },
      {
        title: "admins",
        url: "/admin/manage-admins",
        icon: IconUsers,
      },
      {
        title: "requestsSubscriptions",
        url: "/admin/requests",
        icon: IconFileDescription,
      },
    ],
    navSecondary: [
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
    ],
  };

  return (
    <SidebarProvider>
      <ScrollToTop />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1">
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar
              variant="inset"
              user={{
                userName: profileData?.userName ?? "",
                email: profileData?.email ?? "",
                role: profileData?.role ?? "",
              }}
              isLoading={isLoading || isFetching}
              sidebarElements={
                profileData?.role === "ORGANISATION"
                  ? sidebarElementsForOrganisation
                  : profileData?.role === "ADMIN"
                    ? sidebarElementsForAdmin
                    : profileData?.role === "SUPER_ADMIN"
                      ? sidebarElementsForSuperAdmin
                      : { navMain: [], navSecondary: [] }
              }
            />
            <SidebarInset>
              <SiteHeader />
              <Outlet />
            </SidebarInset>
          </SidebarProvider>
        </div>
      </main>
    </SidebarProvider>
  );
}
