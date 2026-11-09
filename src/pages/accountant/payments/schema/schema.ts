import { z } from "zod";

export const cancelReceiptSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required").max(1000),
});

export type CancelReceiptFormValues = z.infer<typeof cancelReceiptSchema>;

const methodLineSchema = z.object({
  paymentMethodId: z.string().uuid("Select a payment method"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  referenceNo: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
});

const allocationSchema = z.object({
  studentFeeItemId: z.string().uuid("Select a fee item"),
  feeInstallmentId: z.string().uuid().optional().or(z.literal("")).nullable(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export const createFeePaymentSchema = z
  .object({
    studentId: z.string().uuid("Select a student"),
    fiscalYearId: z.string().uuid().optional().or(z.literal("")),
    paymentDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD (BS)"),
    remarks: z.string().max(1000).optional().or(z.literal("")),
    methodLines: z.array(methodLineSchema).min(1, "At least one payment method line is required"),
    allocations: z.array(allocationSchema).min(1, "At least one allocation is required"),
  })
  .superRefine((data, ctx) => {
    const sum = (arr: Array<{ amount: number }>) => arr.reduce((s, r) => s + Number(r.amount || 0), 0);
    const methodTotal = sum(data.methodLines);
    const allocTotal = sum(data.allocations);
    if (Math.abs(methodTotal - allocTotal) > 0.0001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allocations"],
        message: `Method lines total (${methodTotal.toFixed(2)}) must equal allocations total (${allocTotal.toFixed(2)})`,
      });
    }
  });

export type CreateFeePaymentFormValues = z.infer<typeof createFeePaymentSchema>;

export const defaultMethodLine = () => ({ paymentMethodId: "", amount: 0, referenceNo: "", bankName: "" });
export const defaultAllocation = () => ({ studentFeeItemId: "", feeInstallmentId: "", amount: 0 });

export const createFeePaymentDefaultValues: CreateFeePaymentFormValues = {
  studentId: "",
  fiscalYearId: "",
  paymentDateBs: "",
  remarks: "",
  methodLines: [defaultMethodLine()],
  allocations: [defaultAllocation()],
};
