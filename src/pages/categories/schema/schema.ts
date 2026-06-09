// components/category/schema/category-schema.ts
import { z } from "zod";

export const CategorySchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  shortName: z
    .string({ message: "Short name is required" })
    .min(1, "Short name is required")
    .max(3, "Short name must be at most 3 characters"),
});

export type T_CategorySchema = z.infer<typeof CategorySchema>;

export const CategorySchemaDefaultValues: T_CategorySchema = {
  name: "",
  shortName: "",
};
