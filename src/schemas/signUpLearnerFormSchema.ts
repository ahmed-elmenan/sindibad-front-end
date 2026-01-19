import { z } from "zod";

export const signUpLearnerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "errors.minLength" })
      .max(50, { message: "errors.maxLength" })
      .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s-]+$/, { message: "errors.regexName" }),

    lastName: z
      .string()
      .min(2, { message: "errors.minLength" })
      .max(50, { message: "errors.maxLength" })
      .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s-]+$/, { message: "errors.regexName" }),

    dateOfBirth: z
      .string()
      .min(1, { message: "errors.dateOfBirthRequired" })
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          return age >= 5 && age <= 120;
        },
        { message: "errors.ageRange" }
      ),

    gender: z.enum(["male", "female"], {
      message: "errors.genderRequired",
    }),

    phoneNumber: z
      .string()
      .min(8, { message: "errors.phoneMinLength" })
      .max(15, { message: "errors.phoneMaxLength" })
      .regex(/^[+]?[0-9\s-]+$/, { message: "errors.phoneFormat" }),

    email: z
      .string()
      .min(1, { message: "errors.required" })
      .email({ message: "errors.emailFormat" }),

    password: z
      .string()
      .min(8, "errors.password.min_length")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "errors.password.requirements"
      ),

    organisationId: z.string().min(1, { message: "errors.required" }),

    profilePicture: z.any().optional(),

    city: z
      .string()
      .min(2, { message: "errors.cityMinLength" })
      .max(50, { message: "errors.cityMaxLength" })
      .optional()
      .or(z.literal("")),

    organisationName: z
      .string()
      .min(2, { message: "errors.organisationNameMinLength" })
      .max(100, { message: "errors.organisationNameMaxLength" })
      .optional()
      .or(z.literal("")),

    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "errors.termsRequired",
    }),
  });

export type SignUpLearnerFormValues = z.infer<typeof signUpLearnerSchema>;

// Schema for admin - acceptTerms is required but has default value
export const signUpLearnerSchemaForAdmin = signUpLearnerSchema.extend({
  acceptTerms: z.boolean().default(true),
});

export type SignUpLearnerFormValuesForAdmin = z.infer<typeof signUpLearnerSchemaForAdmin>;
