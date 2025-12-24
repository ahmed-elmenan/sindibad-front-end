import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { useFormContext } from "@/contexts/SignUpOrgFormContext";
import {
  organisationSchema,
  type OrganisationData,
  type OrganisationType,
} from "@/schemas/signUpOrgFormShema";
import { MOROCCO_CITIES } from "@/data/moroccoCities";

export const Step1Organisation: React.FC = () => {
  // --- Hook de traduction ---
  const { t } = useTranslation();

  // --- Récupération du contexte du formulaire ---
  const { formData, updateFormData, setCurrentStep } = useFormContext();

  // --- Initialisation du formulaire avec react-hook-form ---
  const form = useForm<OrganisationData>({
    resolver: zodResolver(organisationSchema),
    defaultValues: formData.organisation || {
      organisationType: "",
      organisationName: "",
      city: "",
      organisationAddress: "",
      organisationWebsite: "",
      organisationEmail: "",
      organisationPhone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // --- Soumission du formulaire ---
  const onSubmit = (data: OrganisationData) => {
    updateFormData("organisation", data);
    setCurrentStep(1);
  };

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    // --- Carte principale du formulaire ---
    <Card className="w-full mx-auto">
      {/* --- En-tête de la carte --- */}
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t("signUp.signUpOrganisation.step1Organisation.title")}
        </CardTitle>
        <CardDescription>
          {t("signUp.signUpOrganisation.step1Organisation.description")}
        </CardDescription>
      </CardHeader>
      <hr />
      <CardContent>
        {/* --- Formulaire d'informations sur l'organisation --- */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Ligne : Type de l'organisation --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organisationType">
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationType.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <Select
                value={form.watch("organisationType")}
                onValueChange={(value) => {
                  form.setValue("organisationType", value as OrganisationType, {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full rtl:text-right h-11 min-h-[2.75rem] py-2">
                  <SelectValue
                    placeholder={t(
                      "signUp.signUpOrganisation.step1Organisation.fields.organisationType.placeholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHOOL">
                    {t(
                      "signUp.signUpOrganisation.step1Organisation.fields.organisationType.options.SCHOOL"
                    )}
                  </SelectItem>

                  <SelectItem value="ASSOCIATION">
                    {t(
                      "signUp.signUpOrganisation.step1Organisation.fields.organisationType.options.ASSOCIATION"
                    )}
                  </SelectItem>
                  <SelectItem value="OTHER">
                    {t(
                      "signUp.signUpOrganisation.step1Organisation.fields.organisationType.options.OTHER"
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Exemple pour le type d'organisation */}
              {form.formState.errors.organisationType && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.organisationType.message as string)}
                </p>
              )}
            </div>
          </div>

          {/* --- Ligne : Nom de l'organisation et Site web --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organisationName">
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationName.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <Input
                {...form.register("organisationName")}
                className="h-11"
                placeholder={t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationName.placeholder"
                )}
              />
              {form.formState.errors.organisationName && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.organisationName.message as string)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organisationWebsite">
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationWebsite.label"
                )}
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...form.register("organisationWebsite")}
                  type="url"
                  className="pl-10 h-11"
                  placeholder={t(
                    "signUp.signUpOrganisation.step1Organisation.fields.organisationWebsite.placeholder"
                  )}
                />
              </div>
              {form.formState.errors.organisationWebsite && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.organisationWebsite.message || "")}
                </p>
              )}
            </div>
          </div>

          {/* --- Ligne : Ville et Adresse --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.city.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={form.watch("city")}
                  onValueChange={(value) => {
                    form.setValue("city", value, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full h-11 pl-10 min-h-[2.75rem]">
                    <SelectValue
                      placeholder={t(
                        "signUp.signUpOrganisation.step1Organisation.fields.city.placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {MOROCCO_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.city.message as string)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisationAddress">
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationAddress.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...form.register("organisationAddress")}
                  className="pl-10 h-11"
                  placeholder={t(
                    "signUp.signUpOrganisation.step1Organisation.fields.organisationAddress.placeholder"
                  )}
                />
              </div>
              {form.formState.errors.organisationAddress && (
                <p className="text-sm text-destructive">
                  {t(
                    form.formState.errors.organisationAddress.message as string
                  )}
                </p>
              )}
            </div>
          </div>

          {/* --- Ligne : Email et Téléphone --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organisationEmail">
                {t(
                  "signUp.signUpOrganisation.step1Organisation.fields.organisationEmail.label"
                )}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...form.register("organisationEmail")}
                  type="email"
                  className="pl-10 h-11"
                  placeholder={t(
                    "signUp.signUpOrganisation.step1Organisation.fields.organisationEmail.placeholder"
                  )}
                />
              </div>
              {form.formState.errors.organisationEmail && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.organisationEmail.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisationPhone">
                {t("common.form.phone.label")}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...form.register("organisationPhone")}
                  type="tel"
                  className="pl-10 h-11"
                  placeholder={t("common.form.phone.placeholder")}
                />
              </div>
              {form.formState.errors.organisationPhone && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.organisationPhone.message || "")}
                </p>
              )}
            </div>
          </div>

          {/* --- Mot de passe et Confirmation du mot de passe --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("common.form.password.label")}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <div className="relative">
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  className="h-11 pr-10"
                  placeholder={t("common.form.password.placeholder")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 cursor-pointer" />
                  ) : (
                    <Eye className="h-5 w-5 cursor-pointer" />
                  )}
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                {t("common.form.password.helper")}
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.password.message || "")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("common.form.confirmPassword.label")}{" "}
                <span className="text-red-500">
                  {t("signUp.signUpOrganisation.step1Organisation.required")}
                </span>
              </Label>
              <div className="relative">
                <Input
                  {...form.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="h-11 pr-10"
                  placeholder={t("common.form.confirmPassword.placeholder")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 cursor-pointer" />
                  ) : (
                    <Eye className="h-5 w-5 cursor-pointer" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.confirmPassword.message || "")}
                </p>
              )}
            </div>
          </div>

          {/* --- Bouton de soumission --- */}
          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {t("signUp.signUpOrganisation.step1Organisation.buttons.next")}
              <ChevronRight className="ml-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
