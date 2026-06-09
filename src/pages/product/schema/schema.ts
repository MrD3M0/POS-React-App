// schema/schema.ts
import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  shortName: z.string().min(1, "Short name is required").max(3),
  price: z
    .number({ message: "Price is required" })
    .min(0, "Price must be positive"),
  quantity: z
    .number({ message: "Quantity is required" })
    .min(0, "Quantity must be positive"),
  categoryId: z.string().min(1, "Category is required"),
});

export type T_ProductSchema = z.infer<typeof ProductSchema>;

export const ProductSchemaDefaultValues: T_ProductSchema = {
  name: "",
  shortName: "",
  price: 0,
  quantity: 0,
  categoryId: "",
};
