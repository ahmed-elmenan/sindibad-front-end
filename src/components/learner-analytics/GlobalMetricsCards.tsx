import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { LearnerGlobalMetrics } from "@/types/learnerAnalytics";

interface GlobalMetricsCardsProps {
  metrics: LearnerGlobalMetrics;
}

export function GlobalMetricsCards({ metrics }: GlobalMetricsCardsProps) {
  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Cours */}
      <Card className="hover:shadow-lg transition-shadow border-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {metrics.totalCoursesEnrolled}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">
                {metrics.totalCoursesCompleted} complétés
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-muted-foreground">
              {metrics.totalCoursesInProgress} en cours
            </span>
          </div>
          
          {/* Mini progress */}
          <div className="mt-3">
            <Progress 
              value={(metrics.totalCoursesCompleted / metrics.totalCoursesEnrolled) * 100} 
              className="h-2 [&>div]:bg-orange-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Leçons */}
      <Card className="hover:shadow-lg transition-shadow border-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leçons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {metrics.totalLessonsCompleted}
            <span className="text-xl text-muted-foreground">/{metrics.totalLessons}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {metrics.overallProgressPercentage.toFixed(1)}% complétées
          </p>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress 
              value={metrics.overallProgressPercentage} 
              className="h-2 [&>div]:bg-orange-500"
            />
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>Progression globale</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Temps passé */}
      <Card className="hover:shadow-lg transition-shadow border-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temps passé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {formatMinutes(metrics.totalTimeSpentMinutes)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {metrics.averageTimePerDay}min/jour en moyenne
          </p>
          
          {/* Active days */}
          <div className="mt-3 p-2 bg-orange-50 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Jours actifs</span>
              <span className="font-semibold text-orange-700">{metrics.activeDays}</span>
            </div>
          </div>

          {/* Longest Streak Badge */}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>Record : {metrics.longestStreak} jours</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Certificats & Streak */}
      <Card className="hover:shadow-lg transition-shadow border-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certificats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {metrics.totalCertificatesEarned}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {metrics.totalCertificatesEarned === 0 
              ? "Aucun certificat pour le moment"
              : `Certificat${metrics.totalCertificatesEarned > 1 ? "s" : ""} obtenu${metrics.totalCertificatesEarned > 1 ? "s" : ""}`
            }
          </p>
          
          {/* Current Streak */}
          <div className="mt-3 p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-md border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Série actuelle</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {metrics.currentStreak}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            {metrics.currentStreak === 0 
              ? "Aucune série en cours"
              : `${metrics.currentStreak} jour${metrics.currentStreak > 1 ? "s" : ""} consécutif${metrics.currentStreak > 1 ? "s" : ""} !`
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
