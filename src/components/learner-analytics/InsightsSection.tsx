import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, CheckCircle, ExternalLink } from "lucide-react";
import type { Insight } from "@/types/learnerAnalytics";

interface InsightsSectionProps {
  insights: Insight[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) {
    return null;
  }

  const getSeverityConfig = (severity: Insight["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return {
          icon: AlertCircle,
          variant: "destructive" as const,
          borderColor: "border-red-500",
          bgColor: "bg-red-50",
        };
      case "WARNING":
        return {
          icon: AlertTriangle,
          variant: "default" as const,
          borderColor: "border-yellow-500",
          bgColor: "bg-yellow-50",
        };
      case "INFO":
        return {
          icon: Info,
          variant: "default" as const,
          borderColor: "border-blue-500",
          bgColor: "bg-blue-50",
        };
      case "SUCCESS":
        return {
          icon: CheckCircle,
          variant: "default" as const,
          borderColor: "border-green-500",
          bgColor: "bg-green-50",
        };
    }
  };

  // Trier par priorité (CRITICAL > WARNING > INFO > SUCCESS)
  const sortedInsights = [...insights].sort((a, b) => {
    const priority = { CRITICAL: 0, WARNING: 1, INFO: 2, SUCCESS: 3 };
    return priority[a.severity] - priority[b.severity];
  });

  // Limiter à 5 insights max pour V1
  const displayedInsights = sortedInsights.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">💡 Insights Automatiques</h3>
        <span className="text-sm text-muted-foreground">
          {displayedInsights.length} insight{displayedInsights.length > 1 ? "s" : ""} détecté{displayedInsights.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayedInsights.map((insight) => {
          const config = getSeverityConfig(insight.severity);
          const Icon = config.icon;

          return (
            <Alert
              key={insight.id}
              variant={config.variant}
              className={`${config.borderColor} border-l-4 ${config.bgColor}`}
            >
              <Icon className="h-4 w-4" />
              <AlertTitle className="font-semibold">{insight.title}</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-sm">{insight.description}</p>
                
                {insight.actionLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      if (insight.actionLink?.startsWith("mailto:")) {
                        window.location.href = insight.actionLink;
                      } else if (insight.actionLink) {
                        window.open(insight.actionLink, "_blank");
                      }
                    }}
                  >
                    {insight.actionLabel}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          );
        })}
      </div>

      {insights.length > 5 && (
        <p className="text-sm text-muted-foreground text-center">
          {insights.length - 5} autre{insights.length - 5 > 1 ? "s" : ""} insight{insights.length - 5 > 1 ? "s" : ""} masqué{insights.length - 5 > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
