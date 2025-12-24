import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NoAccessMessageProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

const NoAccessMessage = ({
  message,
  redirectPath = "/courses",
  redirectLabel,
}: NoAccessMessageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const defaultMessage = t("lessonPage.noAccess", "Vous n'avez pas accès à cette vidéo.");
  const defaultRedirectLabel = t("lessonPage.backToCourses", "Retour aux cours");

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 h-screen">
      <div className="text-red-500 mb-4">
        <AlertCircle size={64} />
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        {t("lessonPage.accessDenied", "Accès refusé")}
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        {message || defaultMessage}
      </p>
      <Button 
        onClick={() => navigate(redirectPath)}
        variant="default"
      >
        {redirectLabel || defaultRedirectLabel}
      </Button>
    </div>
  );
};

export default NoAccessMessage;
