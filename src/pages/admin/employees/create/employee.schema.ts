import { EMPLOYEE_CREATE_SCHEMA, EMPLOYEE_ROLES, type T_EMPLOYEE_CREATE } from "@/pages/admin/users/schema/schema";

export { EMPLOYEE_CREATE_SCHEMA, EMPLOYEE_ROLES };
export type { T_EMPLOYEE_CREATE };

/** Zero-based index of a wizard step. */
export type T_EMPLOYEE_STEP = 0 | 1 | 2;

export const EMPLOYEE_LAST_STEP: T_EMPLOYEE_STEP = 2;

export const EMPLOYEE_STEPS: readonly { readonly label: string }[] = [
  { label: "Personal" },
  { label: "Employment" },
  { label: "Bank & Review" },
] as const;

/**
 * Fields rendered (and validated on "Next") per step.
 * Next validation uses `EMPLOYEE_STEP_FIELDS[step]`.
 */
export const EMPLOYEE_STEP_FIELDS: Record<
  T_EMPLOYEE_STEP,
  readonly (keyof T_EMPLOYEE_CREATE)[]
> = {
  0: [
    "firstName",
    "middleName",
    "lastName",
    "gender",
    "dobBs",
    "phone",
    "permanentAddress",
    "temporaryAddress",
  ],
  1: ["employeeCode", "designation", "role", "joinDateBs", "email", "password"],
  2: ["panNo", "ssfNo", "bankName", "bankAccountNo"],
};

/** Reverse lookup: which step owns a field (used to jump back on API errors). */
export const EMPLOYEE_STEP_INDEX_BY_FIELD: Record<string, T_EMPLOYEE_STEP> =
  Object.entries(EMPLOYEE_STEP_FIELDS).reduce(
    (acc, [step, fields]) => {
      const stepIndex = Number(step) as T_EMPLOYEE_STEP;
      fields.forEach((field) => {
        acc[field] = stepIndex;
      });
      return acc;
    },
    {} as Record<string, T_EMPLOYEE_STEP>,
  );

export const getStepIndexForField = (field: string): T_EMPLOYEE_STEP | undefined =>
  EMPLOYEE_STEP_INDEX_BY_FIELD[field];

export const EMPLOYEE_FIELD_LABELS: Record<keyof T_EMPLOYEE_CREATE, string> = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  gender: "Gender",
  dobBs: "Date of Birth (BS)",
  phone: "Phone",
  permanentAddress: "Permanent Address",
  temporaryAddress: "Temporary Address",
  employeeCode: "Employee Code",
  designation: "Designation",
  role: "Role",
  joinDateBs: "Join Date (BS)",
  email: "Email",
  password: "Password",
  panNo: "PAN No.",
  ssfNo: "SSF No.",
  bankName: "Bank Name",
  bankAccountNo: "Bank Account No.",
};

const GENDER_LABELS: Record<T_EMPLOYEE_CREATE["gender"], string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHERS: "Others",
};

/** Human readable value for the read-only review summary. */
export const formatEmployeeFieldValue = (
  field: keyof T_EMPLOYEE_CREATE,
  value: string | undefined,
): string => {
  const normalized = value?.trim();
  if (!normalized) return "—";
  if (field === "gender") return GENDER_LABELS[normalized as T_EMPLOYEE_CREATE["gender"]] ?? normalized;
  if (field === "role") return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  if (field === "password") return "••••••••";
  return normalized;
};
