import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { useFormContext } from "@/contexts/SignUpOrgFormContext";
import {
  coordinatorSchema,
  type CoordinatorData,
} from "@/schemas/signUpOrgFormShema";

export const Step2Coordinator: React.FC = () => {
  // --- Hook de traduction ---
  const { t } = useTranslation();

  // --- Récupération du contexte du formulaire ---
  const { formData, updateFormData, setCurrentStep } = useFormContext();

  // --- Initialisation du formulaire avec react-hook-form ---
  const form = useForm<CoordinatorData>({
    resolver: zodResolver(coordinatorSchema),
    defaultValues: formData.coordinator || {
      firstName: "",
      lastName: "",
    },
  });

  // --- Soumission du formulaire ---
  const onSubmit = (data: CoordinatorData) => {
    updateFormData("coordinator", data);
    setCurrentStep(2);
  };

  return (
    // --- Carte principale du formulaire ---
    <Card className="w-full mx-auto">
      {/* --- En-tête de la carte --- */}
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-accent" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t("signUp.signUpOrganisation.step2Coordinator.title")}
        </CardTitle>
        <CardDescription>
          {t("signUp.signUpOrganisation.step2Coordinator.description")}
        </CardDescription>
      </CardHeader>
      <hr />
      <CardContent>
        {/* --- Formulaire d'informations du coordinateur --- */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Ligne : Prénom et Nom --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t(
                  "common.form.firstName.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step2Coordinator.required")}
                </span>
              </Label>
              <Input
                className="h-11"
                {...form.register("firstName")}
                placeholder={t(
                  "common.form.firstName.placeholder"
                )}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.firstName.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t(
                  "common.form.lastName.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step2Coordinator.required")}
                </span>
              </Label>
              <Input
                className="h-11"
                {...form.register("lastName")}
                placeholder={t(
                  "common.form.lastName.placeholder"
                )}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.lastName.message || "")}
                </p>
              )}
            </div>
          </div>

          {/* --- Boutons de navigation --- */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(0)}
            >
              <ChevronLeft className="mr-2 h-4 w-4 rtl:rotate-180" />
              {t("signUp.signUpOrganisation.step2Coordinator.buttons.previous")}
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {t("signUp.signUpOrganisation.step2Coordinator.buttons.next")}
              <ChevronRight className="ml-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
