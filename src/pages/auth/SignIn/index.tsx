"use client";

import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/auth.service"; // Add setToken to imports
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function LoginPage() {
  const { setUser } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  

  const isRTL = i18n.language === "ar";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t("login2.email_required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("login2.email_invalid");
    }

    if (!formData.password) {
      newErrors.password = t("login2.password_required");
    } else if (formData.password.length < 6) {
      newErrors.password = t("login2.password_min");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success && result.token) {
        const userData = {
          id: result.id ?? "",
          email: result.email ?? formData.email,
          role: result.role ?? "LEARNER",
          name: (result.email ?? formData.email).split("@")[0],
          isActive: result.isActive
        };

        setUser(userData);
        localStorage.setItem("userEmail", userData.email);

        toast.success(t("login2.login_success"));

        if (userData.role === "ORGANISATION") {
          setTimeout(() => {
            navigate("/organisation/dashboard");
          }, 800);
        } else if (userData.role === "LEARNER") {
          setTimeout(() => {
            navigate("/courses");
          }, 800);
        } else if (userData.role === "ADMIN") {
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 800);
        } else {
          toast.error(t("login2.login_error"));
        }
      } else if (!result.success && result.isActive === false){
        toast.error(t("login2.account_inactive"));
      } else {
        toast.error(t("login2.login_error"));
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      toast.error(t("login2.login_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div
      className={`flex items-center justify-center p-4  !bg-gray-50 min-h-screen mt-[-50px] ${
        isRTL ? "rtl" : "ltr"
      }`}
      style={{ backgroundColor: "var(--background2)" }}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {t("login2.title")}
            </CardTitle>
            <CardDescription>{t("login2.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("login2.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`${errors.email ? "border-destructive" : ""} h-11`}
                  placeholder={t("login2.email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("login2.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`${
                      errors.password ? "border-destructive" : ""
                    } pr-10 h-11`}
                    placeholder={t("login2.password")}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-700" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-700" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="text-primary p-0 h-auto"
                  disabled={isLoading}
                  onClick={() => navigate("/forgetPassword")}
                >
                  {t("login2.forgot_password")}
                </Button>
              </div>

              <div className="space-y-4">
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("login2.loading")}
                    </div>
                  ) : (
                    t("login2.login_button")
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("login2.no_account")}{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="text-primary hover:underline font-medium bg-transparent border-none cursor-pointer"
                    >
                      {t("login2.sign_up")}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
