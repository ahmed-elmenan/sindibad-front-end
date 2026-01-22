"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { NavMain } from "@/components/NavMain";
import { NavSecondary } from "@/components/NavSecondary";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function AppSidebar({
  user,
  sidebarElements,
  isLoading,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { userName: string; email: string; role: string };
  isLoading?: boolean;
  sidebarElements: {
    navMain: React.ComponentProps<typeof NavMain>["items"];
    navSecondary: React.ComponentProps<typeof NavSecondary>["items"];
  };
}) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    // set HTML dir on the sidebar so native elements and layout behave in RTL
    <Sidebar side={isRtl ? "right" : "left"} collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <span className="hover:bg-transparent active:bg-transparent focus:bg-transparent cursor-default group">
                <IconInnerShadowTop className="!size-5 group-hover:text-black" />
                <span className="text-base font-semibold group-hover:text-black pointer-events-none">
                  Sindibad
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="space-y-2 p-2">
            {/* NavMain skeleton items */}
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-5 w-5 rounded bg-gray-200" />
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                </div>
              ))}
            </div>
            
            {/* NavSecondary skeleton items */}
            <div className="mt-auto pt-4 space-y-1">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-4 w-4 rounded bg-gray-200" />
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <NavMain items={sidebarElements.navMain} isRtl={isRtl} />
            <NavSecondary
              items={sidebarElements.navSecondary}
              className="mt-auto"
            />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            userName: user?.userName ?? "",
            email: user?.email ?? "",
            role: user?.role ?? "",
          }}
          isLoading={isLoading}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
