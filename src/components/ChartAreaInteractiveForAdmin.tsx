"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from '@/hooks/useMobile'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { useTranslation } from "react-i18next"

export const description = "Évolution des inscriptions et des cours complétés"

// Données statiques pour les inscriptions et complétion de cours
const chartData = [
  { date: "2024-04-01", inscriptions: 8, completions: 2 },
  { date: "2024-04-08", inscriptions: 12, completions: 4 },
  { date: "2024-04-15", inscriptions: 5, completions: 3 },
  { date: "2024-04-22", inscriptions: 7, completions: 2 },
  { date: "2024-04-29", inscriptions: 9, completions: 3 },
  { date: "2024-05-06", inscriptions: 14, completions: 5 },
  { date: "2024-05-13", inscriptions: 10, completions: 7 },
  { date: "2024-05-20", inscriptions: 8, completions: 6 },
  { date: "2024-05-27", inscriptions: 11, completions: 4 },
  { date: "2024-06-03", inscriptions: 16, completions: 7 },
  { date: "2024-06-10", inscriptions: 12, completions: 8 },
  { date: "2024-06-17", inscriptions: 15, completions: 9 },
  { date: "2024-06-24", inscriptions: 18, completions: 11 },
]

const chartConfig = {
  stat: {
    label: "Statistiques",
  },
  inscriptions: {
    label: "Inscriptions",
    color: "hsl(215, 100%, 50%)", // Bleu vif
  },
  completions: {
    label: "Cours complétés",
    color: "hsl(142, 76%, 36%)", // Vert
  },
} satisfies ChartConfig

export function ChartAreaInteractiveForAdmin() {
  const isMobile = useIsMobile()
  const {t} = useTranslation()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("dashboard.learnersProgress", "Progression des apprenants")}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {t("dashboard.inscriptionsVsCompletions", "Comparaison des inscriptions et complétion de cours")}
          </span>
          <span className="@[540px]/card:hidden">Inscriptions vs Complétion</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">{t("dashboard.lastWeek", "7 jours")}</ToggleGroupItem>
            <ToggleGroupItem value="30d">{t("dashboard.lastMonth", "30 jours")}</ToggleGroupItem>
            <ToggleGroupItem value="90d">{t("dashboard.last3Months", "90 jours")}</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="90 jours" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                {t("dashboard.lastWeek", "7 jours")}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {t("dashboard.lastMonth", "30 jours")}
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                {t("dashboard.last3Months", "90 jours")}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillInscriptions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(215, 100%, 50%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(215, 100%, 50%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="completions"
              type="natural"
              fill="url(#fillCompletions)"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
            />
            <Area
              dataKey="inscriptions"
              type="natural"
              fill="url(#fillInscriptions)"
              stroke="hsl(215, 100%, 50%)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
