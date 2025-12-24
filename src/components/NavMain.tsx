"use client";

import { type Icon } from "@tabler/icons-react";
import { useLocation } from "react-router-dom";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/Sidebar";

export function NavMain({
  items,
  isRtl = false,
}: {
  isRtl?: boolean;
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu></SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            // Garder l'ordre DOM (icône puis texte). Le titre prend l'espace restant et s'aligne selon isRtl
            const rowClass = "flex items-center gap-2 w-full";
            const titleClass = isRtl ? "flex-1 text-right" : "flex-1 text-left";
            return (
              <SidebarMenuItem key={item.title}>
                <Link to={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    className={`hover:bg-primary ${
                      isActive ? "bg-primary text-white" : ""
                    }`}
                  >
                    <span className={rowClass}>
                      {item.icon && <item.icon />}
                      <span className={titleClass}>
                        {t("sidebar." + item.title)}
                      </span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
