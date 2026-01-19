import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivateAndResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords
    if (newPassword.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    // Get token from URL
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setError(t("activateAccount.missingToken"));
      return;
    }

    setLoading(true);

    try {
      // Call API to activate and reset password
      await api.post("/auth/activate-and-reset-password", {
        token,
        newPassword,
      });

      setMessage(t("activateAccount.passwordSetSuccess"));
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t("activateAccount.passwordSetError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 mt-[-50px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t("activateAccount.setPassword")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("activateAccount.setPasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("auth.enterNewPassword")}
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("auth.confirmNewPassword")}
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("auth.settingPassword") : t("auth.setPassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
