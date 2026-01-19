import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllOrganisations } from "@/services/organisation.service";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfileImageUploader from "@/components/ProfileImageUploader";

import { signUpLearnerSchema } from "@/schemas/signUpLearnerFormSchema";
import type { SignUpLearnerFormValues } from "@/schemas/signUpLearnerFormSchema";
import { registerLearner } from "@/services/auth.service";
import type { LearnerRanking } from "@/types/Learner";

interface LearnerFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "view" | "edit";
  learner?: LearnerRanking;
  onSuccess?: () => void;
}

export default function LearnerFormModal({
  open,
  onClose,
  mode,
  learner,
  onSuccess,
}: LearnerFormModalProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = mode === "view";
  const isEdit = mode === "edit";

  // Fetch organisations
  const { data: organisations = [], isLoading: isLoadingOrganisations } =
    useQuery({
      queryKey: ["organisations"],
      queryFn: getAllOrganisations,
    });

  // Initialize form with validation schema
  const form = useForm<SignUpLearnerFormValues>({
    resolver: zodResolver(signUpLearnerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: learner?.fullName?.split(" ")[0] || "",
      lastName: learner?.fullName?.split(" ").slice(1).join(" ") || "",
      dateOfBirth: "",
      gender: "male",
      phoneNumber: "",
      email: learner?.username || "",
      password: "",
      organisationId: "",
      profilePicture: learner?.avatarUrl || "",
      city: "",
      organisationName: "",
      acceptTerms: true,
    },
  });

  const onSubmit = async (data: SignUpLearnerFormValues) => {
    console.log("✅ Form submitted successfully!");
    console.log("📋 Form data:", data);
    console.log("❌ Form errors:", form.formState.errors);
    
    if (isReadOnly) return;

    setIsSubmitting(true);
    console.log("🚀 Submitting new learner:", data);

    try {
      const dataToSend = {
        ...data,
        isActive: true,
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
      };

      if (isEdit && learner) {
        // Update learner - à implémenter selon votre API
        toast.success(t("common.success"), {
          description: t("learners.updateSuccess"),
        });
      } else {
        // Create new learner
        console.log("Submitting new learner:", dataToSend);
        const result = await registerLearner(dataToSend);
        if (result.success) {
          toast.success(t("common.success"), {
            description: t("learners.addSuccess"),
          });
          onSuccess?.();
          onClose();
        } else {
          toast.error(t("common.error"), {
            description: result.message,
          });
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t("common.error"), {
        description: t("common.unexpectedError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CustomFormMessage: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (typeof children === "string" && children.startsWith("errors.")) {
      return <p className="text-sm text-destructive">{t(children)}</p>;
    }
    return <FormMessage>{children}</FormMessage>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl sm:max-w-4xl w-[75vw] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogDescription className="text-center">
            {mode === "add"}
            {mode === "view" && t("learners.viewLearnerDescription")}
            {mode === "edit" && t("learners.editLearnerDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ProfileImageUploader
                          onChange={(file: File | undefined) =>
                            field.onChange(file)
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    {t("common.form.firstName.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("common.form.firstName.placeholder")}
                            {...field}
                            className="h-11"
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.firstName?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    {t("common.form.lastName.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("common.form.lastName.placeholder")}
                            {...field}
                            className="h-11"
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.lastName?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    {t("common.form.dateOfBirth.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-11"
                            disabled={isReadOnly}
                            max={new Date().toISOString().split("T")[0]}
                            min="1900-01-01"
                          />
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.dateOfBirth?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    {t("common.form.gender.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className="!h-11 w-full">
                              <SelectValue
                                placeholder={t(
                                  "common.form.gender.placeholder",
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">
                                {t("common.form.gender.options.male")}
                              </SelectItem>
                              <SelectItem value="female">
                                {t("common.form.gender.options.female")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.gender?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    {t("common.form.email.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("common.form.email.placeholder")}
                            {...field}
                            className="h-11"
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.email?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    {t("common.form.phoneNumber.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t(
                              "common.form.phoneNumber.placeholder",
                            )}
                            {...field}
                            className="h-11"
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.phoneNumber?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Passwords - Only for add/edit mode */}
            {!isReadOnly && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      {t("common.form.password.label")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t(
                                  "common.form.password.placeholder",
                                )}
                                {...field}
                                className="h-11 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <CustomFormMessage>
                            {form.formState.errors.password?.message}
                          </CustomFormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      {t("learners.organisation") ?? "Organisation"}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="organisationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isReadOnly || isLoadingOrganisations}
                            >
                              <SelectTrigger className="!h-11 w-full">
                                <SelectValue
                                  placeholder={
                                    isLoadingOrganisations
                                      ? (t("common.loading") ?? "Chargement...")
                                      : (t("learners.selectOrganisation") ??
                                        "Sélectionner une organisation")
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {organisations.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <CustomFormMessage>
                            {form.formState.errors.organisationId?.message}
                          </CustomFormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {isReadOnly ? t("common.close") : t("common.cancel")}
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      {t("common.loading")}
                    </>
                  ) : isEdit ? (
                    t("common.update")
                  ) : (
                    t("common.add")
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
