import { z } from "zod";

export const updateLearnerFormSchema = z.object({
  firstName: z.string().min(1, "account.validation.firstName.required"),
  lastName: z.string().min(1, "account.validation.lastName.required"),
  email: z.string().email("account.validation.email.invalid"),
  phoneNumber: z.string().min(1, "account.validation.phone.required").min(10, "account.validation.phone.length")
});

export type UpdateLearnerFormValues = z.infer<typeof updateLearnerFormSchema>;