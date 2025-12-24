import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, User, Users, CheckCircle } from "lucide-react";
import { Step1Organisation } from "@/components/form/SignUpOrganisation/steps/Step1Organisation";
import { Step2Coordinator } from "@/components/form/SignUpOrganisation/steps/Step2Coordinator";
import { Step3Learners } from "@/components/form/SignUpOrganisation/steps/Step3Learners";
import { StepSummary } from "@/components/form/SignUpOrganisation/steps/StepSummary";
import { SignUpOrgFormContext } from "@/contexts/SignUpOrgFormContext";
import type { SignUpOrgFormData } from "@/schemas/signUpOrgFormShema";
import { Progress } from "@/components/ui/progress";

const SignUpOrganisation: React.FC = () => {
  // --- Hook de traduction ---
  const { t } = useTranslation();

  // --- État du formulaire et logique de navigation ---
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SignUpOrgFormData>>({});

  const updateFormData = (step: keyof SignUpOrgFormData, data: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  // --- Définition des étapes du formulaire ---
  const steps = [
    {
      title: t("signUp.signUpOrganisation.steps.organisation"),
      icon: Building2,
    },
    { title: t("signUp.signUpOrganisation.steps.coordinator"), icon: User },
    { title: t("signUp.signUpOrganisation.steps.beneficiaries"), icon: Users },
    { title: t("signUp.signUpOrganisation.steps.summary"), icon: CheckCircle },
  ];

  // --- Calcul de la progression ---
  const progress = ((currentStep + 1) / steps.length) * 100;

  // --- Rendu de l'étape courante ---
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Organisation />;
      case 1:
        return <Step2Coordinator />;
      case 2:
        return <Step3Learners />;
      case 3:
        return <StepSummary />;
      default:
        return <Step1Organisation />;
    }
  };

  return (
    // --- Fournisseur du contexte du formulaire ---
    <SignUpOrgFormContext.Provider
      value={{ formData, updateFormData, currentStep, setCurrentStep }}
    >
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* --- En-tête du formulaire --- */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {t("signUp.signUpOrganisation.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("signUp.signUpOrganisation.subtitle")}
              </p>
            </div>

            {/* --- Barre de progression --- */}
            <div className="mb-6">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  {t("signUp.signUpOrganisation.progress.step")}{" "}
                  {currentStep + 1} {t("signUp.signUpOrganisation.progress.of")}{" "}
                  {steps.length}
                </span>
                <span>
                  {Math.round(progress)}%{" "}
                  {t("signUp.signUpOrganisation.progress.completed")}
                </span>
              </div>
            </div>

            {/* --- Navigation entre les étapes --- */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div key={index} className="flex items-center">
                      <div
                        className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                        ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCompleted
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }
                      `}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-2 hidden sm:block">
                        <div
                          className={`text-sm font-medium ${
                            isActive
                              ? "text-primary"
                              : isCompleted
                              ? "text-accent"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-8 h-0.5 mx-4 ${
                            isCompleted ? "bg-accent" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- Affichage du contenu de l'étape courante --- */}
          <div
            className="flex justify-center"
          >
            {renderStep()}
          </div>
        </div>
      </div>
    </SignUpOrgFormContext.Provider>
  );
};

export default SignUpOrganisation;
