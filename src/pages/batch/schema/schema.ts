import { z } from "zod";
import NepaliDate from "nepali-date-converter";

export const BatchSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  name: z.string().min(1, "Batch name is required"),
  startDate: z.date().optional(),
  currentTermNumber: z.number().int().min(1, "Term must be at least 1"),
  isActive: z.boolean(),
});

export type T_BatchSchema = z.infer<typeof BatchSchema>;

export const BatchDefaultValues: T_BatchSchema = {
  courseId: "",
  name: "",
  startDate: undefined,
  currentTermNumber: 1,
  isActive: true,
};

// What the API receives
export type T_BatchPayload = Omit<T_BatchSchema, "startDate"> & {
  startDateBs?: string;
};

// Date (AD) -> "YYYY-MM-DD" (BS)
export const toBatchPayload = ({
  startDate,
  ...rest
}: T_BatchSchema): T_BatchPayload => ({
  ...rest,
  startDateBs: startDate
    ? new NepaliDate(startDate).format("YYYY-MM-DD")
    : undefined,
});

// "YYYY-MM-DD" (BS) -> Date (AD)
export const bsToDate = (bs?: string | null): Date | undefined =>
  bs ? new NepaliDate(bs).toJsDate() : undefined;
