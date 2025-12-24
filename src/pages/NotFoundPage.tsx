import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-10">
      <img
        src="/404.svg"
        alt="404"
        className="w-64 h-64 mb-6 select-none pointer-events-none"
        draggable={false}
      />
      <h1 className="text-4xl font-bold text-destructive mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        {t("notFound.message")}
      </p>
      <Button asChild>
        <Link to="/">{t("notFound.backHome") || "Retour à l'accueil"}</Link>
      </Button>
    </div>
  )
}

export default NotFoundPage
