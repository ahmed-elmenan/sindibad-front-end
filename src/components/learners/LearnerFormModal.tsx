import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllOrganisations } from "@/services/organisation.service";
import { getLearnerProfileById, updateLearner, uploadProfilePicture } from "@/services/learner.service";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);

  const isReadOnly = mode === "view";
  const isEdit = mode === "edit";

  // Check if user is an organisation
  const isOrganisationUser = user?.role === "ORGANISATION";
  const userOrganisationId = isOrganisationUser ? user?.id : null;

  // Fetch organisations
  const { data: organisations = [], isLoading: isLoadingOrganisations } =
    useQuery({
      queryKey: ["organisations"],
      queryFn: getAllOrganisations,
    });

  // Fetch full learner details for edit mode
  const { data: learnerDetails } = useQuery({
    queryKey: ["learner", learner?.id],
    queryFn: () => getLearnerProfileById(learner!.id),
    enabled: Boolean(isEdit && learner?.id),
  });

  // Initialize form with validation schema
  const form = useForm<SignUpLearnerFormValues>({
    resolver: zodResolver(signUpLearnerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phoneNumber: "",
      email: "",
      password: "",
      organisationId: userOrganisationId || "",
      profilePicture: "",
      city: "",
      organisationName: "",
      acceptTerms: true,
      isActive: true,
    },
  });

  // Load learner data into form when available
  useEffect(() => {
    if (isEdit && learnerDetails) {
      const values = {
        firstName: learnerDetails.firstName || "",
        lastName: learnerDetails.lastName || "",
        dateOfBirth: learnerDetails.dateOfBirth || "",
        gender: learnerDetails.gender?.toLowerCase() || "male",
        phoneNumber: learnerDetails.phoneNumber || "",
        email: learnerDetails.email || "",
        password: "",
        organisationId: "", // Will be set from organisation data if available
        profilePicture: learnerDetails.profilePicture || "",
        city: "",
        organisationName: "",
        acceptTerms: true,
        isActive: learnerDetails.isActive ?? true,
      };
      
      // Store initial values for comparison
      setInitialValues(values);
      
      // Set form values
      Object.keys(values).forEach((key) => {
        form.setValue(key as keyof SignUpLearnerFormValues, values[key as keyof typeof values]);
      });
    } else if (!isEdit && userOrganisationId) {
      form.setValue("organisationId", userOrganisationId);
    }
  }, [isEdit, learnerDetails, form, userOrganisationId]);

  const onSubmit = async (data: SignUpLearnerFormValues) => {
    if (isReadOnly) return;

    setIsSubmitting(true);

    try {
      if (isEdit && learner) {
        // Check if any values have changed
        const hasChanges = initialValues && Object.keys(data).some((key) => {
          const k = key as keyof SignUpLearnerFormValues;
          // Skip password if empty
          if (k === "password" && !data[k]) return false;
          return data[k] !== initialValues[k];
        });

        if (!hasChanges) {
          toast.info(t("common.info"), {
            description: t("learners.noChanges") ?? "Aucune modification détectée",
          });
          setIsSubmitting(false);
          return;
        }

        // Prepare update data - only changed fields
        const updateData: any = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
          isActive: data.isActive,
        };

        // Only include password if provided
        if (data.password) {
          updateData.password = data.password;
        }

        await updateLearner(learner.id, updateData);
        
        // Upload profile picture if changed
        if (data.profilePicture && data.profilePicture !== initialValues?.profilePicture) {
          try {
            await uploadProfilePicture(learner.id, data.profilePicture);
          } catch (error) {
            console.error("Error uploading profile picture:", error);
            // Continue anyway, the learner was updated
          }
        }
        
        toast.success(t("common.success"), {
          description: t("learners.updateSuccess") ?? "Apprenant mis à jour avec succès",
        });
        onSuccess?.();
        onClose();
      } else {
        // Create new learner - send everything including profile picture in one request
        const dataToSend = {
          ...data,
          isActive: data.isActive ?? true,
          gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
        };

        const result = await registerLearner(dataToSend);
        if (result.success) {
          toast.success(t("common.success"), {
            description: t("learners.addSuccess") ?? "Apprenant ajouté avec succès",
          });
          onSuccess?.();
          onClose();
        } else {
          toast.error(t("common.error"), {
            description: result.message,
          });
        }
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(t("common.error"), {
        description: error.message || t("common.unexpectedError"),
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
                              disabled={isReadOnly || isLoadingOrganisations || isOrganisationUser}
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
