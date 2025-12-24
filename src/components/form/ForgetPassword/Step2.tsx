import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from "lucide-react";

interface Message {
  type: "success" | "error";
  text: string;
}

interface Step2Props {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToStep1: () => void;
  otpError?: string;
  isLoading: boolean;
  message: Message | null;
}

const Step2: React.FC<Step2Props> = ({
  email,
  otp,
  onOtpChange,
  onSubmit,
  onBackToStep1,
  otpError,
  isLoading,
  message,
}) => {
  const { t } = useTranslation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Gestionnaire pour les changements dans les inputs OTP
  const handleOtpInputChange = (index: number, value: string) => {
    const singleChar = value.slice(0, 1); // Take only first character
    if (!/^\d*$/.test(singleChar)) return; // Accepter seulement les chiffres

    // Créer un nouveau tableau OTP en s'assurant qu'il fait toujours 6 caractères
    const newOtp = new Array(6).fill("");
    const currentOtp = otp.padEnd(6, "").split("");

    // Copier les valeurs existantes
    for (let i = 0; i < 6; i++) {
      newOtp[i] = currentOtp[i] || "";
    }

    // Mettre à jour la case spécifique
    newOtp[index] = singleChar;

    const otpString = newOtp.join("");
    onOtpChange(otpString);

    // Passer automatiquement au champ suivant (toujours de gauche à droite)
    if (singleChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gestionnaire pour les touches spéciales
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      // Créer un nouveau tableau OTP en s'assurant qu'il fait toujours 6 caractères
      const newOtp = new Array(6).fill("");
      const currentOtp = otp.padEnd(6, "").split("");

      // Copier les valeurs existantes
      for (let i = 0; i < 6; i++) {
        newOtp[i] = currentOtp[i] || "";
      }

      if (newOtp[index]) {
        // Effacer le caractère actuel
        newOtp[index] = "";
      } else if (index > 0) {
        // Si la case est vide, passer à la précédente et l'effacer
        newOtp[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      const otpString = newOtp.join("");
      onOtpChange(otpString);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gestionnaire pour le collage
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    // Toujours remplir à partir de la case la plus à gauche (index 0)
    const newOtp = new Array(6).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    onOtpChange(newOtp.join(""));

    // Mettre le focus sur le dernier champ rempli ou le premier vide
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <CardTitle className="text-2xl font-bold text-accent">
          {t("forgetPassword.step2.title")}
        </CardTitle>
        <CardDescription>
          {t("forgetPassword.step2.description")} <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp-0">{t("forgetPassword.step2.otp_label")}</Label>

            {/* Conteneur des 6 rectangles OTP */}
            <div className="flex justify-center gap-2" dir="ltr">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  id={`otp-${index}`}
                  type="text"
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-12 h-12 text-center text-lg font-semibold
                    border-2 rounded-lg
                    focus:ring-2 focus:ring-accent focus:border-accent
                    ${
                      otpError
                        ? "border-destructive"
                        : "border-muted-foreground/30"
                    }
                    ${otp[index] ? "border-accent bg-accent/5" : ""}
                    transition-all duration-200
                  `}
                  maxLength={1}
                  disabled={isLoading}
                  autoComplete="off"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-sm text-destructive flex items-center justify-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4" />
                {otpError}
              </p>
            )}
          </div>      

          {message && (
            <Alert
              className={
                message.type === "error"
                  ? "border-destructive bg-destructive/10"
                  : "border-accent bg-accent/10"
              }
            >
              {message.type === "error" ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle className="h-4 w-4 text-accent" />
              )}
              <AlertDescription className="text-foreground">
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                {t("forgetPassword.step2.verifying")}
              </div>
            ) : (
              t("forgetPassword.step2.verify_button")
            )}
          </Button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onBackToStep1}
              className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("forgetPassword.step2.back_to_email")}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Step2;
