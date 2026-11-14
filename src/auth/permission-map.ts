import type { T_Role } from "@/lib/models";

// `module:action` strings; front-end UX only — the backend enforces again.
// Permission names are derived from the real workflows described in the
// domain notes. Keep them in sync with the backend's own permission checks.
export const PERMISSION_MAP = {
  // === ADMIN: owns setup and keeps the system running ===
  "admin:users:read": ["ADMIN"],
  "admin:users:create": ["ADMIN"],
  "admin:users:update": ["ADMIN"],
  "admin:users:delete": ["ADMIN"],

  "admin:employees:read": ["ADMIN"],
  "admin:employees:create": ["ADMIN"],
  "admin:employees:update": ["ADMIN"],
  "admin:employees:delete": ["ADMIN"],

  "admin:students:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
  ],
  "admin:students:create": ["ADMIN", "TEACHER"], // teacher adds, admin can create approved
  "admin:students:approve": ["ADMIN"],
  "admin:students:reject": ["ADMIN"],
  "admin:students:status": ["ADMIN"], // change status Active/Graduated/Dropped/Suspended

  "admin:courses:read": ["ADMIN"],
  "admin:courses:create": ["ADMIN"],
  "admin:courses:update": ["ADMIN"],
  "admin:courses:delete": ["ADMIN"],

  "admin:batches:read": ["ADMIN"],
  "admin:batches:create": ["ADMIN"],
  "admin:batches:update": ["ADMIN"],
  "admin:batches:move": ["ADMIN"], // move batch to next semester/year

  "admin:terms:read": ["ADMIN"],
  "admin:terms:create": ["ADMIN"],
  "admin:terms:update": ["ADMIN"],

  "admin:subjects:read": ["ADMIN"],
  "admin:subjects:create": ["ADMIN"],
  "admin:subjects:update": ["ADMIN"],
  "admin:subjects:delete": ["ADMIN"],

  "admin:teachingAssignments:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
  ],
  "admin:teachingAssignments:assign": ["ADMIN"],
  // A teacher only sees their own classes/assignments (nav: "My Classes").
  "teacher:classes:read": ["TEACHER"],

  // === PRINCIPAL: approves academic and payroll work ===
  "principal:attendance:mark": ["PRINCIPAL"],
  "principal:attendance:correct": ["PRINCIPAL"],
  "principal:results:read": ["PRINCIPAL", "ACCOUNTANT", "TEACHER", "STAFF"],
  "principal:results:approve": ["PRINCIPAL"],
  "principal:results:reject": ["PRINCIPAL"],
  "principal:results:publish": ["PRINCIPAL"],
  "principal:payroll:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT"],
  "principal:payroll:approve": ["PRINCIPAL"],
  "principal:payroll:reject": ["PRINCIPAL"],
  "principal:oversight": ["PRINCIPAL", "ADMIN"],
  "principal:notices:publish": ["PRINCIPAL", "ADMIN"],

  // === ACCOUNTANT: handles everything money-related ===
  "accountant:fees:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT"],
  "accountant:fees:structure:create": ["ACCOUNTANT"],
  "accountant:fees:structure:assign": ["ACCOUNTANT"],
  "accountant:fees:custom:add": ["ACCOUNTANT"],
  "accountant:fees:discount:give": ["ACCOUNTANT"],
  "accountant:fees:skip:add": ["ACCOUNTANT"],
  "accountant:fees:split:add": ["ACCOUNTANT"],
  "accountant:payments:record": ["ACCOUNTANT"],
  "accountant:payments:split": ["ACCOUNTANT"],
  "accountant:receipt:print": ["ACCOUNTANT"],
  "accountant:receipt:cancel": ["ADMIN", "ACCOUNTANT"],
  "accountant:journal:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT"],
  "accountant:journal:post": ["ACCOUNTANT"],
  "accountant:journal:reverse": ["ACCOUNTANT"],
  "accountant:salary:maintain": ["ACCOUNTANT"],
  "accountant:payroll:generate": ["ACCOUNTANT"],
  "accountant:payroll:submit": ["ACCOUNTANT"],
  "accountant:payroll:markPaid": ["ACCOUNTANT"],
  // An accountant may create notices and address everybody or selected groups.
  "accountant:notices:manage": ["ACCOUNTANT"],
  // Scholarships: the accountant defines and grants them, the principal may
  // only look at what was given.
  "scholarship:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT"],
  "scholarship:manage": ["ADMIN", "ACCOUNTANT"],

  // === TEACHER: works with own assigned batch, term and subject ===
  "teacher:dashboard:read": ["TEACHER"],
  "teacher:attendance:take": ["TEACHER"],
  "teacher:attendance:own": ["TEACHER"],
  "teacher:attendance:percentage": ["TEACHER"],
  "teacher:students:own": ["TEACHER"],
  "teacher:students:create": ["TEACHER"],
  "teacher:students:edit": ["TEACHER"],
  "teacher:exams:create": ["TEACHER"],
  "teacher:exams:mark": ["TEACHER"],
  "teacher:results:generate": ["TEACHER"],
  "teacher:results:submit": ["TEACHER"],
  "teacher:results:own": ["TEACHER"],
  "teacher:notices:read": ["TEACHER"],
  // A teacher may create a notice for the classes they teach.
  "teacher:notices:create": ["TEACHER"],
  // A teacher may READ their own batch pay only — creating/changing a batch
  // pay is an accountant/admin task because it feeds straight into payroll.
  "teacher:batchPay:read": ["TEACHER"],
  "teacher:batchPay:manage": ["ADMIN", "ACCOUNTANT"],

  // === STAFF: views own profile, payslips and attendance, reads notices ===
  "staff:profile:own": ["STAFF"],
  "staff:payslips:own": ["STAFF"],
  "staff:attendance:own": ["STAFF"],
  "staff:notices:read": ["STAFF"],

  // === Cross-role / system ===
  "system:dashboard:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
  ],
  "admin:lookups:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "TEACHER"],
  "admin:settings:read": ["ADMIN", "PRINCIPAL"],
  "admin:notices:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
  ],
  "system:notices:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
  ],
  "system:notices:create": ["ADMIN", "PRINCIPAL"],
  "system:fiscalYear:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
  ],
  "admin:audit:read": ["ADMIN", "PRINCIPAL"],
  "admin:holidays:read": [
    "ADMIN",
    "PRINCIPAL",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
  ],
  // The help page (role guide, shortcuts, modules, setup) is open to everyone.
  "system:help:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "TEACHER", "STAFF"],
  "admin:dashboard:read": ["ADMIN"],
  "principal:dashboard:read": ["PRINCIPAL"],
  "accountant:dashboard:read": ["ACCOUNTANT"],
  "staff:dashboard:read": ["STAFF"],
} as const;

export type PermissionKey = keyof typeof PERMISSION_MAP;

export function hasPermission(
  role: T_Role | undefined,
  permission: PermissionKey,
): boolean {
  if (!role) return false;
  const allowed: readonly string[] = PERMISSION_MAP[permission];
  return allowed.includes(role);
}
