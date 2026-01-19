import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function ActivateAndResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div 
      className="flex items-center justify-center p-4 !bg-gray-50 min-h-screen mt-[-50px]"
      style={{ backgroundColor: "var(--background2)" }}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {t("activateAccount.setPassword")}
            </CardTitle>
            <CardDescription>{t("activateAccount.setPasswordDescription")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${error ? "border-destructive" : ""} pr-10 h-11`}
                    placeholder={t("auth.enterNewPassword")}
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-700 !border-0" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-700 !border-0" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${error ? "border-destructive" : ""} pr-10 h-11`}
                    placeholder={t("auth.confirmNewPassword")}
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-700 !border-0" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-700 !border-0" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}

              {message && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("auth.settingPassword")}
                    </div>
                  ) : (
                    t("auth.setPassword")
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
