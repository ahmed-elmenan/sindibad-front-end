import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isReadOnly = mode === "view";
  const isEdit = mode === "edit";

  // Initialize form with validation schema
  const form = useForm<SignUpLearnerFormValues>({
    resolver: zodResolver(signUpLearnerSchema),
    defaultValues: {
      firstName: learner?.fullName?.split(" ")[0] || "",
      lastName: learner?.fullName?.split(" ").slice(1).join(" ") || "",
      dateOfBirth: "",
      gender: "male",
      phoneNumber: "",
      email: learner?.username || "",
      password: "",
      confirmPassword: "",
      profilePicture: learner?.avatarUrl || "",
      acceptTerms: isEdit || isReadOnly,
    },
  });

  const onSubmit = async (data: SignUpLearnerFormValues) => {
    if (isReadOnly) return;
    
    setIsSubmitting(true);
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
        const result = await registerLearner(dataToSend);
        if (result.success) {
          setIsSuccess(true);
          toast.success(t("common.success"), {
            description: t("learners.addSuccess"),
          });
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
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

  const getTitle = () => {
    switch (mode) {
      case "add":
        return t("learners.addLearner");
      case "edit":
        return t("learners.editLearner");
      case "view":
        return t("learners.viewLearner");
      default:
        return "";
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="p-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-accent mb-2">
                {t("signUp.signUpOrganisation.stepSummary.success.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("learners.learnerAddedSuccessfully")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "add" && t("signUp.signUpLearner.description")}
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
                          onChange={(file: File | undefined) => field.onChange(file)}
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
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                disabled={isReadOnly}
                                className={cn(
                                  "h-11 w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>
                                    {t("common.form.dateOfBirth.placeholder")}
                                  </span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date: Date | undefined) => {
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
                              }}
                              autoFocus
                              disabled={(date: Date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
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
                            <SelectTrigger className="h-11">
                              <SelectValue
                                placeholder={t("common.form.gender.placeholder")}
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
                            placeholder={t("common.form.phoneNumber.placeholder")}
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
                                placeholder={t("common.form.password.placeholder")}
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
                      {t("common.form.confirmPassword.label")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={t(
                                  "common.form.confirmPassword.placeholder"
                                )}
                                {...field}
                                className="h-11 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <CustomFormMessage>
                            {form.formState.errors.confirmPassword?.message}
                          </CustomFormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions - Only for add mode */}
            {mode === "add" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={form.watch("acceptTerms")}
                  className="border-2 border-primary"
                  onCheckedChange={(checked) => {
                    form.setValue("acceptTerms", checked as boolean, {
                      shouldValidate: true,
                    });
                  }}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  {t("signUp.signUpLearner.acceptTerms")}
                </Label>
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
