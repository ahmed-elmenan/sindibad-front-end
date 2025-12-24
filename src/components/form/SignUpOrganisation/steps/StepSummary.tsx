import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  User,
  Users,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useFormContext } from "@/contexts/SignUpOrgFormContext";
import { useMutation } from "@tanstack/react-query";
import { createOrganisation } from "@/services/organisation.service";
import type { SignUpOrgFormData } from "@/schemas/signUpOrgFormShema";
import { toast } from "@/components/ui/sonner";

export const StepSummary: React.FC = () => {
  // --- Hook de traduction ---
  const { t } = useTranslation();

  // --- Récupération du contexte du formulaire ---
  const { formData, setCurrentStep } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: createOrganisation,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      setIsSubmitting(false);

      toast.error({
        title: t("errors.accountCreationError"),
        description: t(`errors.${error.message}`),
      });

      console.error(error);
    },
  });

  // --- Gestion de la soumission finale ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      mutation.mutate(formData as SignUpOrgFormData);
    } catch (error) {
      // toast.error supprimé d'ici
      console.error("Erreur lors de la soumission :", error);
      setIsSubmitting(false);
    }
  };

  // --- Affichage du message de succès ---
  if (isSuccess) {
    return (
      // --- Carte de confirmation d'inscription ---
      <Card className="w-full mx-auto">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Contenu de succès existant */}
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-accent mb-2">
                {t("signUp.signUpOrganisation.stepSummary.success.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("signUp.signUpOrganisation.stepSummary.success.description")}
              </p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t(
                  "signUp.signUpOrganisation.stepSummary.success.emailNotification"
                )}{" "}
                <strong>{formData.organisation?.organisationEmail}</strong>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    // --- Carte principale du récapitulatif ---
    <Card className="w-full mx-auto">
      {/* --- En-tête du récapitulatif --- */}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t("signUp.signUpOrganisation.stepSummary.title")}
        </CardTitle>
        <CardDescription>
          {t("signUp.signUpOrganisation.stepSummary.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Grille des informations récapitulatives --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- Bloc organisation --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-primary" />
                {t(
                  "signUp.signUpOrganisation.stepSummary.sections.organisation.title"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.type"
                  )}
                </strong>{" "}
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationType.options." +
                    formData.organisation?.organisationType
                )}
              </div>
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.name"
                  )}
                </strong>{" "}
                {formData.organisation?.organisationName}
              </div>
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.city"
                  )}
                </strong>{" "}
                {formData.organisation?.city}
              </div>
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.address"
                  )}
                </strong>{" "}
                {formData.organisation?.organisationAddress}
              </div>
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.email"
                  )}
                </strong>{" "}
                {formData.organisation?.organisationEmail}
              </div>
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.phone"
                  )}
                </strong>{" "}
                {formData.organisation?.organisationPhone}
              </div>
              {formData.organisation?.organisationWebsite && (
                <div>
                  <strong>
                    {t(
                      "signUp.signUpOrganisation.stepSummary.sections.organisation.fields.website"
                    )}
                  </strong>{" "}
                  {formData.organisation.organisationWebsite}
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Bloc coordinateur --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-accent" />
                {t(
                  "signUp.signUpOrganisation.stepSummary.sections.coordinator.title"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.coordinator.fields.name"
                  )}
                </strong>{" "}
                {formData.coordinator?.firstName}{" "}
                {formData.coordinator?.lastName}
              </div>
            </CardContent>
          </Card>

          {/* --- Bloc bénéficiaires --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-secondary" />
                {t(
                  "signUp.signUpOrganisation.stepSummary.sections.beneficiaries.title"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.beneficiaries.fields.excelFile"
                  )}
                </strong>{" "}
                {formData.learners?.excelFile?.name ||
                  t(
                    "signUp.signUpOrganisation.stepSummary.sections.beneficiaries.fields.notProvided"
                  )}
              </div>
              <div>
                <strong>
                  {t(
                    "signUp.signUpOrganisation.stepSummary.sections.beneficiaries.fields.termsAccepted"
                  )}
                </strong>{" "}
                {formData.learners?.acceptTerms
                  ? t(
                      "signUp.signUpOrganisation.stepSummary.sections.beneficiaries.fields.yes"
                    )
                  : t(
                      "signUp.signUpOrganisation.stepSummary.sections.beneficiaries.fields.no"
                    )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Boutons de navigation --- */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ChevronLeft className="mr-2 h-4 w-4 rtl:rotate-180" />
            {t("signUp.signUpOrganisation.stepSummary.buttons.modify")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90"
          >
            {isSubmitting
              ? t("signUp.signUpOrganisation.stepSummary.buttons.submitting")
              : t("signUp.signUpOrganisation.stepSummary.buttons.validate")}
            {!isSubmitting && <CheckCircle className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
