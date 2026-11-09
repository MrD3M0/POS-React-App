import { z } from "zod";

const bsDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format");

export const fiscalYearCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required (e.g. 2081/82)").max(50),
  startDateBs: bsDate,
  endDateBs: bsDate,
  isCurrent: z.boolean(),
  isClosed: z.boolean(),
});

export type FiscalYearCreateFormValues = z.infer<typeof fiscalYearCreateSchema>;

export const fiscalYearCreateDefaultValues: FiscalYearCreateFormValues = {
  name: "",
  startDateBs: "",
  endDateBs: "",
  isCurrent: false,
  isClosed: false,
};
