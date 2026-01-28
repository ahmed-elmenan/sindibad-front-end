import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Save, Edit3, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { passwordService } from "@/services/password.service";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";
import { getChangePasswordSchema } from "@/utils/validation-schemas";


interface ChangePasswordFormProps {
  onPasswordChangeSuccess?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onPasswordChangeSuccess }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(true);

  // Memoize the schema for better performance
  const changePasswordSchema = useMemo(() => getChangePasswordSchema(t), [t]);
  type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await passwordService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: ""
      });
      
      toast.success(t("accountPage.passwordChange.success"));
      form.reset();
      setShowUpdateForm(false);
      onPasswordChangeSuccess?.();
    } catch (error: any) {
      console.error("Password change failed:", error);
      const errorMessage = error.message || "errors.passwordChange.error";
      toast.error(t(errorMessage));

      // Set specific field errors based on the error type
      if (errorMessage === "errors.password.incorrect") {
        form.setError("currentPassword", { message: t("errors.currentPassword.incorrect") });
      } else if (errorMessage === "errors.password.mismatch") {
        form.setError("confirmNewPassword", { message: t("errors.confirmPassword.mismatch") });
      } else if (errorMessage === "errors.password.requirements") {
        form.setError("newPassword", { message: t("errors.password.requirements") });
      } else {
        // For other errors, show a generic error message
        form.setError("root", { message: t("errors.passwordChange.generic") });
      }
    }
  };

  const CustomFormMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (typeof children === "string" && children.startsWith("errors.")) {
      return <p className="text-sm text-destructive">{t(children)}</p>;
    }
    return <FormMessage>{children}</FormMessage>;
  };

  return (
    <Card className={isRTL ? "rtl" : "ltr"}>
      <CardContent className="space-y-4">
        {!showUpdateForm ? (
          <Button
            onClick={() => setShowUpdateForm(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {t("accountPage.passwordChange.changePassword")}
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("accountPage.passwordChange.title")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpdateForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Separator />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">
                    {t("accountPage.passwordChange.currentPassword.label")}
                  </Label>
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder={t("accountPage.passwordChange.currentPassword.placeholder")}
                              {...field}
                              className={`h-11 ${isRTL ? "pl-10" : "pr-10"}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full px-3 py-2 hover:bg-transparent`}
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              tabIndex={-1}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.currentPassword?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    {t("accountPage.passwordChange.newPassword.label")}
                  </Label>
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder={t("accountPage.passwordChange.newPassword.placeholder")}
                              {...field}
                              className={`h-11 ${isRTL ? "pl-10" : "pr-10"}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full px-3 py-2 hover:bg-transparent`}
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              tabIndex={-1}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          {t("common.form.password.helper")}
                        </div>
                        <CustomFormMessage>
                          {form.formState.errors.newPassword?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                    {t("accountPage.passwordChange.confirmNewPassword.label")}
                  </Label>
                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmNewPassword ? "text" : "password"}
                              placeholder={t("accountPage.passwordChange.confirmNewPassword.placeholder")}
                              {...field}
                              className={`h-11 ${isRTL ? "pl-10" : "pr-10"}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full px-3 py-2 hover:bg-transparent`}
                              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <CustomFormMessage>
                          {form.formState.errors.confirmNewPassword?.message}
                        </CustomFormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-none"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner />
                        {t("accountPage.passwordChange.submitting")}
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t("accountPage.passwordChange.submitButton")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateForm(false)}
                    className="flex-1 sm:flex-none"
                    size="lg"
                  >
                    {t("accountPage.buttons.cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;