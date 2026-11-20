import { z } from "zod";

/**
 * The due cap depends on the selected student + term, so the schema is built
 * with the current due amount baked in. Pass Number.POSITIVE_INFINITY while
 * no term is selected (the cap is then skipped).
 */
export function createBillingPaymentSchema(dueAmount: number) {
  return z
    .object({
      studentId: z.string().min(1, "Select a student"),
      termNumber: z.string().min(1, "Select a term"),
      // The form keeps the amount as a number (parsed from the input), so no coercion.
      amountPaid: z.number().positive("Amount must be greater than 0"),
      paymentMethodId: z.string().min(1, "Select a payment method"),
      referenceNo: z.string().optional().or(z.literal("")),
      paymentDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date (BS) is required (YYYY-MM-DD)"),
      receiptNo: z.string().optional().or(z.literal("")),
      remarks: z.string().optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (Number.isFinite(dueAmount) && data.amountPaid > dueAmount + 0.009) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPaid"],
          message: `Amount cannot exceed due Rs. ${dueAmount.toFixed(2)}`,
        });
      }
    });
}

export type BillingPaymentFormValues = z.infer<ReturnType<typeof createBillingPaymentSchema>>;

export const billingPaymentDefaultValues: BillingPaymentFormValues = {
  studentId: "",
  termNumber: "",
  amountPaid: 0,
  paymentMethodId: "",
  referenceNo: "",
  paymentDateBs: "",
  receiptNo: "",
  remarks: "",
};
