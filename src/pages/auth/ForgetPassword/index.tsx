import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Step1 from "@/components/form/ForgetPassword/Step1";
import Step2 from "@/components/form/ForgetPassword/Step2";
import Step3 from "@/components/form/ForgetPassword/Step3";
import { resetPassword, sendOTP, verifyOTP } from "@/services/auth.service";

// Types
interface FormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

const ForgetPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  // États
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Handlers
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateOTP = (otp: string): boolean => {
    return otp.length === 6 && /^\d{6}$/.test(otp);
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
    );
  };

  // Étape 1 : Envoi de l'email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setErrors({ email: t("forgetPassword.step1.email_required") });
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: t("forgetPassword.step1.email_invalid") });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Simulation d'appel API
      const response = await sendOTP(formData.email);

      if (response.success) {
        // Simuler succès
        setMessage({
          type: "success",
          text: t("forgetPassword.step1.success_message", {
            email: formData.email,
          }),
        });
        setTimeout(() => {
          setCurrentStep(2);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: response.message });
      }
    } catch {
      setMessage({
        type: "error",
        text: t("forgetPassword.step1.error_message"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2 : Vérification OTP
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp) {
      setErrors({ otp: t("forgetPassword.step2.otp_required") });
      return;
    }

    if (!validateOTP(formData.otp)) {
      setErrors({ otp: t("forgetPassword.step2.otp_invalid") });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Simulation d'appel API
      const response = await verifyOTP(formData.email, formData.otp);

      // Simuler validation (pour la démo, accepter "123456")
      if (response.success) {
        setMessage({
          type: "success",
          text: t("forgetPassword.step2.success_message"),
        });

        setTimeout(() => {
          setCurrentStep(3);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: t("forgetPassword.step2.error_message"),
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: t("forgetPassword.step2.validation_error"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 3 : Réinitialisation du mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<FormData> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = t("forgetPassword.step3.new_password_required");
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = t("forgetPassword.step3.password_invalid");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "forgetPassword.step3.confirm_password_required"
      );
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("forgetPassword.step3.password_mismatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await resetPassword(
        formData.email,
        formData.newPassword
      );

      if (response.success) {
        setMessage({
          type: "success",
          text: t("forgetPassword.step3.success_message"),
        });

        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: response.message,
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: t("forgetPassword.step3.error_message"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu des étapes
  const renderStep1 = () => (
    <Step1
      email={formData.email}
      onEmailChange={(value) => handleInputChange("email", value)}
      onSubmit={handleEmailSubmit}
      emailError={errors.email}
      isLoading={isLoading}
      message={message}
    />
  );

  const renderStep2 = () => (
    <Step2
      email={formData.email}
      otp={formData.otp}
      onOtpChange={(value) => handleInputChange("otp", value)}
      onSubmit={handleOTPSubmit}
      onBackToStep1={() => setCurrentStep(1)}
      otpError={errors.otp}
      isLoading={isLoading}
      message={message}
    />
  );

  const renderStep3 = () => (
    <Step3
      newPassword={formData.newPassword}
      confirmPassword={formData.confirmPassword}
      onNewPasswordChange={(value) => handleInputChange("newPassword", value)}
      onConfirmPasswordChange={(value) =>
        handleInputChange("confirmPassword", value)
      }
      onSubmit={handlePasswordSubmit}
      newPasswordError={errors.newPassword}
      confirmPasswordError={errors.confirmPassword}
      isLoading={isLoading}
      message={message}
      showNewPassword={showNewPassword}
      showConfirmPassword={showConfirmPassword}
      onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
      onToggleConfirmPassword={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
    />
  );

  return (
    <div
      className={`flex items-center justify-center p-4 ${
        isRTL ? "rtl" : "ltr"
      }`}
      style={{ backgroundColor: "var(--background2)" }}
    >
      <div className="w-full max-w-2xl">
        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-8 mb-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all
                    ${
                      currentStep >= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`
                      w-16 h-1 mx-4 transition-all
                      ${currentStep > step ? "bg-primary" : "bg-muted"}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-base text-muted-foreground">
            {t("progress.step")} {currentStep} {t("progress.of")} 3
          </div>
        </div>
        {/* Contenu de l'étape */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
