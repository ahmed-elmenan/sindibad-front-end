import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllOrganisations } from "@/services/organisation.service";
import {
  getLearnerFormData,
  updateLearner,
  uploadProfilePicture,
  sendPasswordResetEmail,
} from "@/services/learner.service";
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
import { CustomSwitch } from "@/components/ui/custom-switch";
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
  onSuccess?: (updatedLearner?: any) => void;
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
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);
  const hasLoadedDataRef = useRef(false);

  const isReadOnly = mode === "view";
  const isEdit = mode === "edit";

  // Check if user is an organisation
  const isOrganisationUser = user?.role === "ORGANISATION";
  const userOrganisationId = isOrganisationUser ? user?.id : null;

  // Default form values (reused for useForm and reset on add)
  const defaultFormValues = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    phoneNumber: "",
    email: "",
    organisationId: userOrganisationId || "",
    profilePicture: "",
    organisationName: "",
    acceptTerms: true,
    isActive: true,
  };

  // Reset initial values and ref when modal is closed
  useEffect(() => {
    if (!open) {
      setInitialValues(null);
      hasLoadedDataRef.current = false;
    }
  }, [open]);

  // When opening the modal in 'add' mode, reset the form to empty defaults
  useEffect(() => {
    if (open && mode === "add") {
      form.reset({ ...defaultFormValues, organisationId: userOrganisationId || "" });
      setInitialValues(null);
      hasLoadedDataRef.current = false;
    }
  }, [open, mode, userOrganisationId]);

  // Fetch organisations
  const { data: organisations = [], isLoading: isLoadingOrganisations } =
    useQuery({
      queryKey: ["organisations"],
      queryFn: getAllOrganisations,
    });

  // Fetch full learner details for edit mode
  const { data: learnerDetails, isLoading: isLoadingLearnerDetails } = useQuery(
    {
      queryKey: ["learnerFormData", learner?.id],
      queryFn: () => getLearnerFormData(learner!.id),
      enabled: Boolean(isEdit && learner?.id && open),
      refetchOnMount: "always",
      staleTime: 0,
    },
  );

  // Initialize form with validation schema
  const form = useForm<SignUpLearnerFormValues>({
    resolver: zodResolver(signUpLearnerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultFormValues,
  });

  // Load learner data into form when available
  useEffect(() => {
    if (isEdit && learnerDetails && !hasLoadedDataRef.current) {
      const values = {
        firstName: learnerDetails.firstName || "",
        lastName: learnerDetails.lastName || "",
        dateOfBirth: learnerDetails.dateOfBirth || "",
        gender: learnerDetails.gender || "male",
        phoneNumber: learnerDetails.phoneNumber || "",
        email: learnerDetails.email || "",
        organisationId: learnerDetails.organisationId || "",
        profilePicture: learnerDetails.profilePicture || "",
        organisationName: "",
        acceptTerms: true,
        isActive: learnerDetails.isActive ?? true,
      };

      // Store initial values for comparison
      setInitialValues(values);

      // Set form values
      Object.keys(values).forEach((key) => {
        form.setValue(
          key as keyof SignUpLearnerFormValues,
          values[key as keyof typeof values],
        );
      });

      // Mark that we've loaded the data
      hasLoadedDataRef.current = true;
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
        const hasChanges =
          initialValues &&
          Object.keys(data).some((key) => {
            const k = key as keyof SignUpLearnerFormValues;

            // Special handling for profilePicture - File object means new upload
            // or a different URL/string
            if (k === "profilePicture") {
              const newVal = data[k];
              const oldVal = initialValues.profilePicture;
              if (newVal instanceof File) return true;
              if (typeof newVal === "string" && newVal !== oldVal) return true;
              return false;
            }

            // For other fields, use strict equality
            return data[k] !== initialValues[k];
          });

        if (!hasChanges) {
          toast.info(t("common.info"), {
            description:
              t("learners.noChanges") ?? "Aucune modification détectée",
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

        let updatedLearner: any = await updateLearner(learner.id, updateData);

        // Upload profile picture if changed and it's a File object
        if (data.profilePicture && data.profilePicture instanceof File) {
          try {
            const imageUrl = await uploadProfilePicture(
              learner.id,
              data.profilePicture,
            );
            // Append cache-buster to force browser to re-fetch if URL didn't change
            const cacheBusted =
              imageUrl + (imageUrl.includes("?") ? "&" : "?") + `v=${Date.now()}`;

            // Mettre à jour l'objet avec la nouvelle URL d'image (préserver tous les autres champs)
            updatedLearner = {
              ...updatedLearner,
              profilePicture: cacheBusted,
            };

            // Also update any cached queries that may reference this learner
            try {
              // Update single learner cache
              const singleKey = ["learner", learner.id];
              const singleCached = queryClient.getQueryData<any>(singleKey);
              if (singleCached) {
                queryClient.setQueryData(singleKey, { ...singleCached, ...updatedLearner });
                console.log("[LearnerFormModal] updated single learner cache", singleKey);
              }

              // Update learnersRanking caches (paginated or array)
              const qc = (queryClient as any).getQueryCache();
              const matches = qc.findAll((q: any) => q.queryKey && q.queryKey[0] === "learnersRanking");
              matches.forEach((q: any) => {
                const key = q.queryKey;
                const cached = queryClient.getQueryData<any>(key);
                if (!cached) return;

                const mergeLearner = (l: LearnerRanking) => (l.id === updatedLearner.id ? { ...l, ...updatedLearner } : l);

                if (cached.content && Array.isArray(cached.content)) {
                  const newContent = cached.content.map(mergeLearner);
                  queryClient.setQueryData(key, { ...cached, content: newContent });
                  console.log("[LearnerFormModal] updated learnersRanking paginated cache", key);
                } else if (Array.isArray(cached)) {
                  const newArr = cached.map(mergeLearner);
                  queryClient.setQueryData(key, newArr);
                  console.log("[LearnerFormModal] updated learnersRanking array cache", key);
                }
              });
            } catch (err) {
              console.error("Error updating caches after upload:", err);
            }
          } catch (error) {
            console.error("Error uploading profile picture:", error);
            toast.error(t("common.error"), {
              description:
                "Une erreur s'est produite lors du traitement de l'image",
            });
            setIsSubmitting(false);
            return;
          }
        }

        // If profile picture wasn't a File but was changed as a string value,
        // still attempt to update ranking caches with the returned updatedLearner
        try {
          const singleKey2 = ["learner", learner.id];
          const singleCached2 = queryClient.getQueryData<any>(singleKey2);
          if (singleCached2) {
            queryClient.setQueryData(singleKey2, { ...singleCached2, ...updatedLearner });
          }

          const qc2 = (queryClient as any).getQueryCache();
          const matches2 = qc2.findAll((q: any) => q.queryKey && q.queryKey[0] === "learnersRanking");
          matches2.forEach((q: any) => {
            const key = q.queryKey;
            const cached = queryClient.getQueryData<any>(key);
            if (!cached) return;

            const mergeLearner = (l: LearnerRanking) => (l.id === updatedLearner.id ? { ...l, ...updatedLearner } : l);

            if (cached.content && Array.isArray(cached.content)) {
              const newContent = cached.content.map(mergeLearner);
              queryClient.setQueryData(key, { ...cached, content: newContent });
            } else if (Array.isArray(cached)) {
              const newArr = cached.map(mergeLearner);
              queryClient.setQueryData(key, newArr);
            }
          });
        } catch (err) {
          console.error("Error updating caches:", err);
        }

        toast.success(t("common.success"), {
          description:
            t("learners.updateSuccess") ?? "Apprenant mis à jour avec succès",
        });
        onSuccess?.(updatedLearner);
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
            description:
              t("learners.addSuccess") ?? "Apprenant ajouté avec succès",
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

  const handleResetPassword = async () => {
    if (!learner?.id) return;

    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(learner.id);
      toast.success(t("common.success"), {
        description:
          t("learners.resetPasswordSuccess") ??
          "Email de réinitialisation envoyé avec succès",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(t("common.error"), {
        description: error.message || t("common.unexpectedError"),
      });
    } finally {
      setIsResettingPassword(false);
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

            {/* Organisation and Active Status on same line */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            disabled={
                              isReadOnly ||
                              isLoadingOrganisations ||
                              isOrganisationUser
                            }
                          >
                            <SelectTrigger className="!h-11 w-full">
                              <SelectValue
                                placeholder={
                                  isLoadingOrganisations
                                    ? (t("common.loading") ?? "Chargement...")
                                    : isOrganisationUser
                                      ? (t("learners.myOrganisation") ??
                                        "Mon organisation")
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

                {/* Active Status Switch - Only for edit mode - On same line as Organisation */}
                {isEdit && (
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      {t("learners.accountStatus") ?? "Statut du compte"}
                    </FormLabel>
                    <div className="flex items-center justify-between h-11 px-4 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">
                        {form.watch("isActive")
                          ? (t("learners.accountActive") ?? "Compte actif")
                          : (t("learners.accountInactive") ?? "Compte inactif")}
                      </span>
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomSwitch
                                checked={field.value ?? true}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                }}
                                disabled={isReadOnly}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              {/* Reset Password Button - Only for edit mode */}
              {isEdit && !isReadOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="text-sm"
                >
                  {isResettingPassword ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t("learners.resetPassword") ??
                        "Réinitialiser mot de passe"}
                    </>
                  )}
                </Button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-4">
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
                    disabled={
                      isSubmitting || (isEdit && isLoadingLearnerDetails)
                    }
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
