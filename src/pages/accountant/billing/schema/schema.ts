import { z } from "zod";

const methodLineSchema = z.object({
  paymentMethodId: z.string().min(1, "Select a payment method"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  referenceNo: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
});

const allocationSchema = z.object({
  studentFeeItemId: z.string().min(1, "Select a fee item"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export const billingPaymentSchema = z
  .object({
    studentId: z.string().min(1, "Select a student"),
    fiscalYearId: z.string().min(1, "Select a fiscal year"),
    studentFeeId: z.string().optional().or(z.literal("")),
    receiptNo: z.string().optional().or(z.literal("")),
    paymentDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date (BS) is required (YYYY-MM-DD)"),
    totalAmount: z.coerce.number().positive("Total amount must be greater than zero"),
    remarks: z.string().optional().or(z.literal("")),
    methodLines: z.array(methodLineSchema).min(1, "At least one method line is required"),
    allocations: z.array(allocationSchema),
  })
  .superRefine((data, ctx) => {
    const sum = (arr: Array<{ amount: number }>) => arr.reduce((s, r) => s + Number(r.amount || 0), 0);
    const methodSum = sum(data.methodLines);
    const allocSum = sum(data.allocations);
    const total = Number(data.totalAmount || 0);
    if (Math.abs(methodSum - total) > 0.009) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["methodLines"], message: `Method lines sum (${methodSum.toFixed(2)}) must equal total (${total.toFixed(2)}).` });
    }
    const hasAllocations = data.allocations.length > 0 && data.allocations.some((a) => a.studentFeeItemId);
    if (hasAllocations) {
      if (Math.abs(allocSum - total) > 0.009) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["allocations"], message: `Allocations sum (${allocSum.toFixed(2)}) must equal total (${total.toFixed(2)}).` });
      }
      data.allocations.forEach((a, i) => {
        if (!a.studentFeeItemId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["allocations", i, "studentFeeItemId"], message: "Select a fee item" });
      });
    }
  });

export type BillingPaymentFormValues = z.infer<typeof billingPaymentSchema>;

export const billingPaymentDefaultValues: BillingPaymentFormValues = {
  studentId: "",
  fiscalYearId: "",
  studentFeeId: "",
  receiptNo: "",
  paymentDateBs: "",
  totalAmount: 0,
  remarks: "",
  methodLines: [{ paymentMethodId: "", amount: 0, referenceNo: "", bankName: "" }],
  allocations: [{ studentFeeItemId: "", amount: 0 }],
};
