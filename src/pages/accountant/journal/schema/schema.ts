import { z } from "zod";

export const journalLineSchema = z.object({
  accountId: z.string().uuid("Select an account"),
  direction: z.enum(["DEBIT", "CREDIT"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional().or(z.literal("")),
  studentId: z.string().uuid().optional().or(z.literal("")),
  employeeId: z.string().uuid().optional().or(z.literal("")),
});

export const journalEntryCreateSchema = z
  .object({
    fiscalYearId: z.string().uuid("Select a fiscal year"),
    dateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD (BS)"),
    description: z.string().trim().min(1, "Description is required").max(1000),
    source: z.enum(["MANUAL", "OPENING"]).optional(),    lines: z.array(journalLineSchema).min(2, "At least 2 lines are required"),
  })
  .superRefine((data, ctx) => {
    let debit = 0;
    let credit = 0;
    data.lines.forEach((l) => {
      if (l.direction === "DEBIT") debit += Number(l.amount || 0);
      else credit += Number(l.amount || 0);
    });
    if (Math.abs(debit - credit) > 0.0001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lines"],
        message: `Debits (${debit.toFixed(2)}) and credits (${credit.toFixed(2)}) must balance`,
      });
    }
  });

export type JournalLineFormValues = z.infer<typeof journalLineSchema>;
export type JournalEntryCreateFormValues = z.infer<typeof journalEntryCreateSchema>;

export const defaultJournalLine = (): JournalLineFormValues => ({
  accountId: "",
  direction: "DEBIT",
  amount: 0,
  description: "",
  studentId: "",
  employeeId: "",
});

export const journalEntryDefaultValues: JournalEntryCreateFormValues = {
  fiscalYearId: "",
  dateBs: "",
  description: "",
  source: "MANUAL",
  lines: [
    { ...defaultJournalLine(), direction: "DEBIT" },
    { ...defaultJournalLine(), direction: "CREDIT" },
  ],
};
