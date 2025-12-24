import * as z from "zod";

// Définir les types d'organisation comme constante pour une meilleure réutilisation
export const ORGANISATION_TYPES = ["SCHOOL", "ASSOCIATION", "OTHER"] as const;
export type OrganisationType = (typeof ORGANISATION_TYPES)[number];

// Schémas de validation
export const organisationSchema = z
  .object({
    organisationType: z
      .string({
        message: "errors.organisationTypeRequired",
      })
      .refine((val) => ORGANISATION_TYPES.includes(val as OrganisationType), {
        message: "errors.organisationTypeRequired",
      }),
    organisationName: z
      .string()
      .min(2, "errors.organisationNameRequired")
      .min(2, "errors.minLength")
      .max(100, "errors.maxLength")
      .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s-]+$/, { message: "errors.regexName" }),

    city: z.string().min(2, "errors.cityRequired"),
    organisationAddress: z.string().min(5, "errors.addressRequired"),
    organisationWebsite: z
      .union([z.string().url("errors.url"), z.literal("")])
      .optional(),
    organisationEmail: z.string().email("errors.email"),
    organisationPhone: z
      .string()
      .min(8, { message: "errors.phoneMinLength" })
      .max(15, { message: "errors.phoneMaxLength" })
      .regex(/^[+]?[0-9\s\-()]+$/, { message: "errors.phoneFormat" }),
    password: z
      .string()
      .min(8, "errors.minLength")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "errors.password"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "errors.passwordMismatch",
    path: ["confirmPassword"],
  });

export const coordinatorSchema = z.object({
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
});

export const learnersSchema = z.object({
  // Validation plus spécifique pour le fichier Excel
  excelFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    }, "errors.invalidFileFormat"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "errors.termsRequired",
  }),
  excelData: z
    .array(
      z.object({
        nom: z.string(),
        prenom: z.string(),
        date_de_naissance: z.string(),
        email: z.union([z.string(), z.object({ text: z.string() })]),
        telephone: z.string(),
        sexe: z.string(),
      })
    )
    .optional(),
});

// Types inférés
export type OrganisationData = z.infer<typeof organisationSchema>;
export type CoordinatorData = z.infer<typeof coordinatorSchema>;
export type LearnersData = z.infer<typeof learnersSchema>;

export interface SignUpOrgFormData {
  organisation: OrganisationData;
  coordinator: CoordinatorData;
  learners: LearnersData;
}
