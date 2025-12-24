import { z } from "zod";
import type { TFunction } from "i18next";

export const getChangePasswordSchema = (t: TFunction) => {
  return z.object({
    currentPassword: z.string().min(1, t("errors.currentPassword.required")),
    newPassword: z
      .string()
      .min(8, t("errors.password.min_length"))
      .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, t("errors.password.requirements")),
    confirmNewPassword: z.string().min(1, t("errors.confirmPassword.required")),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: t("errors.confirmPassword.mismatch"),
    path: ["confirmNewPassword"],
  });
};