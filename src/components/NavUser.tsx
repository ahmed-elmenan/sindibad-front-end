"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Sidebar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import { handleLogoutUser } from "@/services/auth.service";
import UserSummarySkeleton from "@/components/UserSummarySkeleton";

export function NavUser({
  user,
  isLoading
}: {
  isLoading?: boolean;
  user: {
    userName: string;
    email: string;
    role: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = React.useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await handleLogoutUser();
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  }, [navigate]);

  // Afficher le skeleton pendant le chargement
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="w-full px-2 py-1">
            <UserSummarySkeleton />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback className="rounded-lg">
                  {user.role === "ORGANISATION" ? "ORG" : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.userName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={
                      user.role === "ORGANISATION"
                        ? "/path/to/org-avatar.png"
                        : "/path/to/admin-avatar.png"
                    }
                    alt={user.userName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.role === "ORGANISATION" ? "ORG" : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.userName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle className="mr-2 h-4 w-4 hover:text-accent-foreground" />
                {t("navUser.account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification className="mr-2 h-4 w-4 hover:text-accent-foreground" />
                {t("navUser.notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconLogout className="mr-2 h-4 w-4 hover:text-accent-foreground" />
              )}
              <span className={isLoggingOut ? "text-muted-foreground" : ""}>
                {isLoggingOut ? t("navUser.loggingOut") : t("navUser.logout")}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
