import type React from "react"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "../ui/card"

type MetricsCardProps = {
  title: string
  value: string | number
  change: {
    value: string | number
    percentage: string
    isPositive: boolean
  }
  chart?: React.ReactNode
}

export const MetricsCard = ({ title, value, change, chart }: MetricsCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border border-border/40 hover:border-border/60 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 rounded-2xl backdrop-blur-sm max-h-[310px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      </div>

      <div className="relative p-4 h-[13rem] flex flex-col justify-between">
        {/* Header section - reduced margin bottom */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 rtl:flex-row-reverse">
            <div
              className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm ${
                change.isPositive
                  ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:shadow-emerald-200/50"
                  : "bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:shadow-red-200/50"
              }`}
            >
              {change.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
          </div>

          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary/50 transition-colors duration-300" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary/20 animate-ping group-hover:animate-pulse" />
          </div>
        </div>

        {/* Main content section - better vertical distribution */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="relative mb-4">
            <p className="text-4xl font-bold text-foreground tracking-tight leading-none group-hover:text-primary/90 transition-colors duration-300">
              {value}
            </p>
            <div className="absolute -bottom-1 left-0 rtl:left-auto rtl:right-0 w-12 h-0.5 bg-gradient-to-r rtl:bg-gradient-to-l from-primary via-accent to-primary/60 rounded-full opacity-70 group-hover:opacity-100 group-hover:w-16 transition-all duration-500" />
          </div>

          {/* Chart area positioned in center */}
          {chart && (
            <div className="flex justify-center mb-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              {chart}
            </div>
          )}
        </div>

        {/* Bottom section - change indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 rtl:flex-row-reverse">
            <span className="text-sm font-medium text-muted-foreground">{change.value}</span>

            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shadow-sm ${
                change.percentage
                  ? change.isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 hover:shadow-emerald-200/50"
                    : "bg-red-50 text-red-700 border border-red-200/60 hover:bg-red-100 hover:shadow-red-200/50"
                  : ""
              }`}
            >
              {change.percentage ? (
                <>
                  {change.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {change.percentage}
                </>
              ) : (
                <span className="opacity-0">--</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`h-1 w-full bg-gradient-to-r rtl:bg-gradient-to-l transition-all duration-500 ${
          change.isPositive
            ? "from-emerald-400/50 via-emerald-500 to-emerald-400/50"
            : "from-red-400/50 via-red-500 to-red-400/50"
        } group-hover:h-1.5 group-hover:shadow-lg`}
      />
    </Card>
  )
}
