import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

interface ErrorStateProps {
  message: string
  onRetry?: () => void
  retryButtonText?: string
  className?: string
}

export default function ErrorState({ 
  message, 
  onRetry, 
  retryButtonText,
  className = "aspect-video flex items-center justify-center bg-muted"
}: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <Card className={className}>
      <div className="text-center">
        <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={onRetry}
          >
            {retryButtonText || t("common.retry") || "Réessayer"}
          </Button>
        )}
      </div>
    </Card>
  )
}
