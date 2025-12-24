import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Pour gérer la navigation avec le bouton retour du navigateur
  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-border/40">
        <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center space-y-6">
          {/* SVG Illustration */}
          <div className="text-primary w-24 h-24 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              <circle cx="12" cy="16" r="1"></circle>
            </svg>
          </div>

          {/* Titre et description */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t("unauthorized.title") || "401 - Accès non autorisé"}
            </h1>
            <p className="text-muted-foreground">
              {t("unauthorized.description") || 
               "Vous n'avez pas l'autorisation d'accéder à cette page."}
            </p>
          </div>

          {/* Bouton de retour */}
          <Button asChild className="mt-4" size="lg">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              {t("unauthorized.backHome") || "Retour à l'accueil"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}