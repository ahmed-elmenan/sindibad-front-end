/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from "recharts";

// Composant StatsChart modernisé
const monthOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Exemple de données : nombre de leçons complétées par mois
const fakeData = [
  { date: "Jan", value: 120 },
  { date: "Feb", value: 135 },
  { date: "Mar", value: 110 },
  { date: "Apr", value: 150 },
  { date: "May", value: 90 },
  { date: "Jun", value: 170 },
  { date: "Jul", value: 140 },
  { date: "Aug", value: 100 },
  { date: "Sep", value: 180 },
  { date: "Oct", value: 200 },
  { date: "Nov", value: 175 },
  { date: "Dec", value: 160 },
];

function filterData(period: string, fullData: { date: string; value: number }[]) {
  const now = new Date();
  switch (period) {
    case "today": {
      // Only current month
      return fakeData.filter(d => d.date === monthOrder[now.getMonth()]);
    }
    case "lastWeek": {
      // Last 2 months
      const lastMonthIdx = now.getMonth();
      const prevMonthIdx = (lastMonthIdx - 1 + 12) % 12;
      return fakeData.filter((_, i) => i === prevMonthIdx || i === lastMonthIdx);
    }
    case "lastMonth": {
      // Last 3 months
      const idx = now.getMonth();
      const idxs = [
        (idx - 2 + 12) % 12,
        (idx - 1 + 12) % 12,
        idx
      ];
      return fakeData.filter((_, i) => idxs.includes(i));
    }
    case "last6Months": {
      // Last 6 months
      const startIdx = (now.getMonth() - 5 + 12) % 12;
      const arr: number[] = [];
      for (let i = 0; i < 6; i++) {
        arr.push((startIdx + i) % 12);
      }
      return fakeData.filter((_, i) => arr.includes(i));
    }
    case "year":
    default:
      return fakeData;
  }
}

interface StatsChartProps {
  period?: string;
  fullData: { date: string; value: number }[];
}

const StatsChart = ({ period = "lastMonth", fullData }: StatsChartProps) => {
  const { t } = useTranslation();
  const data = filterData(period, fakeData);


  return (
    <div className="h-[320px] w-full bg-white rounded-xl shadow-sm border border-border/60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 13, fontWeight: 500 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl border border-border/60 bg-white p-3 shadow-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-gray-500 tracking-wide">{t("dashboard.completedLessons")}</span>
                        <span className="font-bold text-primary text-lg">{payload[0].value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-gray-500 tracking-wide">{t("dashboard.month")}</span>
                        <span className="font-semibold text-gray-900">{payload[0].payload.date}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#e54e1c"
            strokeWidth={3}
            dot={{ fill: '#e54e1c', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#e54e1c', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;