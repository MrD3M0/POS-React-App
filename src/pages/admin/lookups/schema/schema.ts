import { z } from "zod";

export const LOOKUP_TYPES = [
  { label: "Leave Type", value: "leaveType" },
  { label: "Period", value: "period" },
  { label: "Exam Type", value: "examType" },
  { label: "Grade Scale", value: "gradeScale" },
  { label: "Fee Head", value: "feeHead" },
  { label: "Payment Method", value: "paymentMethod" },
  { label: "Salary Component", value: "salaryComponent" },
  { label: "Chart of Account", value: "chartAccount" },
] as const;

export type LookupType = (typeof LOOKUP_TYPES)[number]["value"];

export const lookupCreateSchema = z
  .object({
    type: z.enum(["leaveType", "period", "examType", "gradeScale", "feeHead", "paymentMethod", "salaryComponent", "chartAccount"]),
    code: z.string().optional().or(z.literal("")),
    name: z.string().optional().or(z.literal("")),
    periodNumber: z.string().optional().or(z.literal("")),
    startTime: z.string().optional().or(z.literal("")),
    endTime: z.string().optional().or(z.literal("")),
    isActive: z.boolean(),
    yearlyAllowed: z.string().optional().or(z.literal("")),
    isPaid: z.boolean(),
    grade: z.string().optional().or(z.literal("")),
    minPercent: z.string().optional().or(z.literal("")),
    maxPercent: z.string().optional().or(z.literal("")),
    gradePoint: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    isPassGrade: z.boolean(),
    componentType: z.string().optional().or(z.literal("")),
    isDeduction: z.boolean(),
    isEmployerContribution: z.boolean(),
    isTaxable: z.boolean(),
    accountType: z.string().optional().or(z.literal("")),
    isGroup: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const req = (path: keyof typeof data, message: string) => {
      const v = data[path];
      if (typeof v === "string" ? !v.trim() : v === undefined || v === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
      }
    };
    if (data.type === "leaveType") { req("code", "Code is required"); req("name", "Name is required"); }
    if (data.type === "period") { req("periodNumber", "Period number is required"); req("name", "Name is required"); req("startTime", "Start time is required"); req("endTime", "End time is required"); }
    if (data.type === "examType") { req("code", "Code is required"); req("name", "Name is required"); }
    if (data.type === "gradeScale") { req("grade", "Grade is required"); req("minPercent", "Min % is required"); req("maxPercent", "Max % is required"); req("gradePoint", "Grade point is required"); }
    if (data.type === "feeHead") { req("code", "Code is required"); req("name", "Name is required"); }
    if (data.type === "paymentMethod") { req("code", "Code is required"); req("name", "Name is required"); }
    if (data.type === "salaryComponent") { req("code", "Code is required"); req("name", "Name is required"); req("componentType", "Type is required"); }
    if (data.type === "chartAccount") { req("code", "Code is required"); req("name", "Name is required"); req("accountType", "Type is required"); }
  });

export type LookupCreateFormValues = z.infer<typeof lookupCreateSchema>;

export function lookupCreateDefaultValues(type: LookupType): LookupCreateFormValues {
  return {
    type,
    code: "",
    name: "",
    periodNumber: "1",
    startTime: "09:00",
    endTime: "10:00",
    isActive: true,
    yearlyAllowed: "",
    isPaid: true,
    grade: "",
    minPercent: "0",
    maxPercent: "100",
    gradePoint: "0",
    description: "",
    isPassGrade: true,
    componentType: "EARNING",
    isDeduction: false,
    isEmployerContribution: false,
    isTaxable: true,
    accountType: "ASSET",
    isGroup: false,
  };
}

export function buildLookupPayload(data: LookupCreateFormValues): Record<string, unknown> {
  switch (data.type) {
    case "leaveType":
      return { code: data.code?.trim(), name: data.name?.trim(), yearlyAllowed: data.yearlyAllowed ? parseInt(data.yearlyAllowed, 10) : undefined, isPaid: data.isPaid };
    case "period":
      return { periodNumber: parseInt(data.periodNumber || "0", 10), name: data.name?.trim(), startTime: data.startTime, endTime: data.endTime, isActive: data.isActive };
    case "examType":
      return { code: data.code?.trim(), name: data.name?.trim() };
    case "gradeScale":
      return { grade: data.grade?.trim(), minPercent: data.minPercent, maxPercent: data.maxPercent, gradePoint: data.gradePoint, description: data.description?.trim() || undefined, isPassGrade: data.isPassGrade };
    case "feeHead":
      return { code: data.code?.trim(), name: data.name?.trim(), isActive: data.isActive };
    case "paymentMethod":
      return { code: data.code?.trim(), name: data.name?.trim(), isActive: data.isActive };
    case "salaryComponent":
      return { code: data.code?.trim(), name: data.name?.trim(), type: data.componentType, isDeduction: data.isDeduction, isEmployerContribution: data.isEmployerContribution, isTaxable: data.isTaxable };
    case "chartAccount":
      return { code: data.code?.trim(), name: data.name?.trim(), type: data.accountType, isGroup: data.isGroup };
    default:
      return {};
  }
}
