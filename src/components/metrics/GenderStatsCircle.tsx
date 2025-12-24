"use client"

import { Card } from "@/components/ui/card"
import { Users, User } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

type GenderStatsProps = {
  totalLearners: number
  maleCount: number
  femaleCount: number
  isLoading?: boolean
}

export const GenderStatsCircle = ({ totalLearners, maleCount, femaleCount, isLoading = false }: GenderStatsProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<"male" | "female" | null>(null)
  const {t} = useTranslation()

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card via-card to-card/95 border border-border/40 rounded-2xl ">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
          <div className="w-48 h-48 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </div>
      </Card>
    )
  }

  const malePercentage = totalLearners > 0 ? (maleCount / totalLearners) * 100 : 0
  const femalePercentage = totalLearners > 0 ? (femaleCount / totalLearners) * 100 : 0

  // SVG circle parameters
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const maleStrokeDasharray = (malePercentage / 100) * circumference
  const femaleStrokeDasharray = (femalePercentage / 100) * circumference
  const femaleStrokeDashoffset = -maleStrokeDasharray

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border border-border/40 hover:border-border/60 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 rounded-2xl max-h-[370px]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-all duration-300">
            <Users className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("statistics.gender_distribution")}
          </h3>
          <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors duration-300 ml-auto" />
        </div>

        {/* Circular Chart */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />

              {/* Male segment */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${maleStrokeDasharray} ${circumference}`}
                className={`transition-all duration-700 ease-out ${
                  hoveredSegment === "male" ? "stroke-[12px] drop-shadow-lg" : ""
                } ${hoveredSegment === "female" ? "opacity-50" : ""}`}
                style={{
                  strokeDashoffset: 0,
                }}
                onMouseEnter={() => setHoveredSegment("male")}
                onMouseLeave={() => setHoveredSegment(null)}
              />

              {/* Female segment */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#ec4899"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${femaleStrokeDasharray} ${circumference}`}
                className={`transition-all duration-700 ease-out ${
                  hoveredSegment === "female" ? "stroke-[12px] drop-shadow-lg" : ""
                } ${hoveredSegment === "male" ? "opacity-50" : ""}`}
                style={{
                  strokeDashoffset: femaleStrokeDashoffset,
                }}
                onMouseEnter={() => setHoveredSegment("female")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-foreground mb-1">{totalLearners.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground font-medium">{t("statistics.total_learners")}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                hoveredSegment === "male"
                  ? "bg-blue-50 border border-blue-200 scale-105"
                  : hoveredSegment === "female"
                    ? "opacity-50"
                    : "hover:bg-muted/30"
              }`}
              onMouseEnter={() => setHoveredSegment("male")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <User className="h-3 w-3" />
                  {t("dashboard.male")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {maleCount.toLocaleString()} ({malePercentage.toFixed(1)}%)
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                hoveredSegment === "female"
                  ? "bg-pink-50 border border-pink-200 scale-105"
                  : hoveredSegment === "male"
                    ? "opacity-50"
                    : "hover:bg-muted/30"
              }`}
              onMouseEnter={() => setHoveredSegment("female")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="w-4 h-4 rounded-full bg-pink-500"></div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <User className="h-3 w-3" />
                  {t("dashboard.female")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {femaleCount.toLocaleString()} ({femalePercentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500/40 via-primary to-pink-500/40 group-hover:h-1.5 transition-all duration-500" />
    </Card>
  )
}
