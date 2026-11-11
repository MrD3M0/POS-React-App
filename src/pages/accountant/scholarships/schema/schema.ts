import { z } from "zod";

export const scholarshipSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  code: z.string().trim().max(50).optional().or(z.literal("")),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .positive("Must be greater than 0")
    .max(100000000, "Too large"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;

export const scholarshipDefaultValues: ScholarshipFormValues = {
  name: "",
  code: "",
  type: "PERCENT",
  value: 0,
  description: "",
  isActive: true,
};

export const grantScholarshipSchema = z.object({
  scholarshipId: z.string().min(1, "Select a scholarship"),
  studentId: z.string().min(1, "Select a student"),
  studentFeeId: z.string().optional().or(z.literal("")),
  feeItemIds: z.array(z.string()),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type GrantScholarshipValues = z.infer<typeof grantScholarshipSchema>;

export const grantScholarshipDefaultValues: GrantScholarshipValues = {
  scholarshipId: "",
  studentId: "",
  studentFeeId: "",
  feeItemIds: [],
  note: "",
};
