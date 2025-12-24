import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";

export default function ActivateAccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>(t("activateAccount.processing"));

  useEffect(() => {
    // Extraire le token de l'URL
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Appeler l'API d'activation
      api.post("/auth/activate-account", { token })
        .then(() => {
          setMessage(t("activateAccount.success"));
          setTimeout(() => navigate("/signin"), 2000);
        })
        .catch(() => {
          setMessage(t("activateAccount.error"));
        });
    } else {
      setMessage(t("activateAccount.missingToken"));
    }
  }, [location, navigate, t]);

  return (
    <div className="flex items-center justify-center mt-20">
      <div className="p-6">{message}</div>
    </div>
  );
}