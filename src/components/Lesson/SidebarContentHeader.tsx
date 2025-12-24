import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Chapter } from "@/types";
import type { TFunction } from "i18next";

interface SidebarContentHeaderProps {
  t: TFunction; // Updated to use TFunction for proper interpolation support
  isRTL: boolean;
  chapters: Chapter[];
  totalLessons: number;
  setIsMobileOpen: (open: boolean) => void;
  setIsDesktopOpen: (open: boolean) => void;
  setOpenChapters: (chapters: string[]) => void;
  setShowSidebarTrigger: (show: boolean) => void;
}

export function SidebarContentHeader({
  t,
  isRTL,
  chapters,
  totalLessons,
  setIsMobileOpen,
  setIsDesktopOpen,
  setOpenChapters,
  setShowSidebarTrigger,
}: SidebarContentHeaderProps) {
  return (
    <div className="p-4 border-b bg-white sticky top-16 z-10 flex items-center justify-between">
      <div className={isRTL ? "text-right" : ""}>
        <h3 className="font-semibold text-lg">
          {t("lessonSidebar.courseContent")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("lessonSidebar.phasesCount", { count: chapters.length })} •{" "}
          {t("lessonSidebar.lessonsCount", {
            count: totalLessons,
          })}
        </p>
      </div>
      {/* Bouton de fermeture à côté du titre */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("lessonSidebar.close")}
        onClick={() => {
          setIsMobileOpen(false);
          setIsDesktopOpen(false);
          setOpenChapters([]);
          setShowSidebarTrigger(false);
        }}
        className="rounded-full ml-2"
      >
        <X className="w-5 h-5 text-black" />
      </Button>
    </div>
  );
}