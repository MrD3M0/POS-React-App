import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const createTeacherStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  universityRegNo: z.string().trim().min(1, "University registration number is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
  dobBs: z.string().optional(),
  admissionDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Admission date (BS) is required"),
  batchId: z.string().min(1, "Batch is required"),
  phone: z.string().optional(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  permanentAddress: z.string().optional(),
  temporaryAddress: z.string().optional(),
  guardianRelation: z.enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"]),
  guardianName: z.string().trim().min(1, "Guardian name is required"),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  guardianOccupation: z.string().optional(),
  guardianAddress: z.string().optional(),
});

export type CreateTeacherStudentValues = z.infer<typeof createTeacherStudentSchema>;

// ─── Wizard layout ───────────────────────────────────────────────────────────

/** Zero-based index of a wizard step. */
export type T_STUDENT_STEP = 0 | 1 | 2 | 3 | 4;

export const STUDENT_LAST_STEP: T_STUDENT_STEP = 4;

export const STUDENT_STEPS: readonly {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    id: "personal",
    title: "Personal Info",
    description: "The student's name, gender and date of birth.",
  },
  {
    id: "academic",
    title: "Academic Info",
    description: "Registration number, batch and admission date.",
  },
  {
    id: "contact",
    title: "Contact Info",
    description: "How the college can reach the student.",
  },
  {
    id: "guardian",
    title: "Guardian Info",
    description: "The primary guardian and their contact details.",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Check every detail before adding the student.",
  },
] as const;

/**
 * Fields rendered (and validated on "Next") per step.
 * Next validation uses `STUDENT_STEP_FIELDS[step]`.
 */
export const STUDENT_STEP_FIELDS: Record<
  T_STUDENT_STEP,
  readonly (keyof CreateTeacherStudentValues)[]
> = {
  0: ["firstName", "middleName", "lastName", "gender", "dobBs"],
  1: ["universityRegNo", "batchId", "admissionDateBs"],
  2: ["phone", "email", "permanentAddress", "temporaryAddress"],
  3: [
    "guardianRelation",
    "guardianName",
    "guardianPhone",
    "guardianEmail",
    "guardianOccupation",
    "guardianAddress",
  ],
  4: [],
};

/** Reverse lookup: which step owns a field (used to jump back on API errors). */
export const STUDENT_STEP_INDEX_BY_FIELD: Record<string, T_STUDENT_STEP> =
  Object.entries(STUDENT_STEP_FIELDS).reduce(
    (acc, [step, fields]) => {
      const stepIndex = Number(step) as T_STUDENT_STEP;
      fields.forEach((field) => {
        acc[field] = stepIndex;
      });
      return acc;
    },
    {} as Record<string, T_STUDENT_STEP>,
  );

/** Fields that arrive from the API under a different (payload) name. */
const FIELD_ALIASES: Record<string, T_STUDENT_STEP> = {
  guardian: 3,
  guardians: 3,
  "guardian.fullName": 3,
  "guardian.phone": 3,
  "guardian.email": 3,
  "guardian.occupation": 3,
  "guardian.address": 3,
  "guardian.relation": 3,
};

export const getStepIndexForField = (
  field: string,
): T_STUDENT_STEP | undefined =>
  STUDENT_STEP_INDEX_BY_FIELD[field] ??
  FIELD_ALIASES[field] ??
  (field.includes(".") ? STUDENT_STEP_INDEX_BY_FIELD[field.split(".")[0] ?? ""] : undefined);

export const STUDENT_FIELD_LABELS: Record<
  keyof CreateTeacherStudentValues,
  string
> = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  gender: "Gender",
  dobBs: "Date of Birth (BS)",
  universityRegNo: "University Reg. No.",
  batchId: "Batch",
  admissionDateBs: "Admission Date (BS)",
  phone: "Phone",
  email: "Email",
  permanentAddress: "Permanent Address",
  temporaryAddress: "Temporary Address",
  guardianRelation: "Guardian Relation",
  guardianName: "Guardian Name",
  guardianPhone: "Guardian Phone",
  guardianEmail: "Guardian Email",
  guardianOccupation: "Occupation",
  guardianAddress: "Guardian Address",
};

export type TBatchOption = {
  label: string;
  value: string;
  searchValues?: string;
};

export type AddStudentStepProps = {
  form: UseFormReturn<CreateTeacherStudentValues>;
  batchOptions: TBatchOption[];
  batchLoading: boolean;
  /** Jump back to a step from the review summary. */
  onEditStep: (step: T_STUDENT_STEP) => void;
};

// ─── Review formatting ───────────────────────────────────────────────────────

const GENDER_LABELS: Record<CreateTeacherStudentValues["gender"], string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHERS: "Others",
};

const RELATION_LABELS: Record<
  CreateTeacherStudentValues["guardianRelation"],
  string
> = {
  FATHER: "Father",
  MOTHER: "Mother",
  GUARDIAN: "Guardian",
  OTHER: "Other",
};

/** Human readable value for the read-only review summary. */
export const formatStudentFieldValue = (
  field: keyof CreateTeacherStudentValues,
  value: string | undefined,
  batchOptions: readonly TBatchOption[],
): string => {
  const normalized = value?.trim();
  if (!normalized) return "—";
  if (field === "gender") {
    return GENDER_LABELS[normalized as CreateTeacherStudentValues["gender"]] ?? normalized;
  }
  if (field === "guardianRelation") {
    return (
      RELATION_LABELS[
        normalized as CreateTeacherStudentValues["guardianRelation"]
      ] ?? normalized
    );
  }
  if (field === "batchId") {
    return batchOptions.find((option) => option.value === normalized)?.label ?? normalized;
  }
  return normalized;
};
