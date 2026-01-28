import { z } from "zod";

export const updateLearnerProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required").min(10, "Phone number must be at least 10 characters"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type UpdateLearnerProfileDTO = z.infer<typeof updateLearnerProfileSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;