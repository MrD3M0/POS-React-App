import { z } from "zod";

export const batchPaySchema = z.object({
  teachingAssignmentId: z.string().min(1, "Teaching assignment is required"),
  ratePerCreditHour: z.string().optional(),
  fixedMonthlyAmount: z.string().optional(),
  effectiveFromBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Effective from date (BS) is required"),
  effectiveToBs: z.string().optional(),
}).refine((v) => !!v.ratePerCreditHour?.trim() || !!v.fixedMonthlyAmount?.trim(), {
  message: "Provide rate per credit hour or fixed monthly amount",
  path: ["ratePerCreditHour"],
});

export type BatchPayValues = z.infer<typeof batchPaySchema>;
