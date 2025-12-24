import { z } from "zod";

const LevelType = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  // Durée par défaut de 60 minutes
  category: z.string().min(1, "Category is required"),
  level: z.enum(LevelType, { message: "Please select a valid level" }),
  imgFile: z
    .instanceof(File)
    .refine((file) => {
      const allowedExtensions = [".png", ".jpg", ".jpeg"];
      return allowedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
    }, "Invalid file type. Only .png, .jpg, .jpeg are allowed.")
    .nullish()
    .optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;
