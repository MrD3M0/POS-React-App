import type { T_Role } from "@/lib/models";
import { clsx } from "clsx";
import { useAuth } from "@/auth/context/auth-context";

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

  "admin:students:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "TEACHER", "STAFF"],
  "admin:students:create": ["TEACHER"], // teacher adds, admin approves
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

  "admin:teachingAssignments:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "TEACHER"],
  "admin:teachingAssignments:assign": ["ADMIN"],

  // === PRINCIPAL: approves academic and payroll work ===
  "principal:attendance:mark": ["PRINCIPAL"],
  "principal:attendance:correct": ["PRINCIPAL"],
  "principal:results:read": ["PRINCIPAL", "ACCOUNTANT", "TEACHER", "STAFF"],
  "principal:results:approve": ["PRINCIPAL"],
  "principal:results:reject": ["PRINCIPAL"],
  "principal:results:publish": ["PRINCIPAL"],
  "principal:payroll:read": ["PRINCIPAL", "ACCOUNTANT"],
  "principal:payroll:approve": ["PRINCIPAL"],
  "principal:payroll:reject": ["PRINCIPAL"],
  "principal:oversight": ["PRINCIPAL", "ADMIN"],
  "principal:notices:publish": ["PRINCIPAL", "ADMIN"],

  // === ACCOUNTANT: handles everything money-related ===
  "accountant:fees:read": ["ADMIN", "ACCOUNTANT"],
  "accountant:fees:structure:create": ["ADMIN"],
  "accountant:fees:structure:assign": ["ADMIN", "ACCOUNTANT"],
  "accountant:fees:custom:add": ["ACCOUNTANT"],
  "accountant:fees:discount:give": ["ACCOUNTANT"],
  "accountant:fees:skip:add": ["ACCOUNTANT"],
  "accountant:fees:split:add": ["ACCOUNTANT"],
  "accountant:payments:record": ["ACCOUNTANT"],
  "accountant:payments:split": ["ACCOUNTANT"],
  "accountant:receipt:print": ["ACCOUNTANT"],
  "accountant:receipt:cancel": ["ACCOUNTANT"],
  "accountant:journal:read": ["ADMIN", "ACCOUNTANT"],
  "accountant:journal:post": ["ADMIN", "ACCOUNTANT"],
  "accountant:journal:reverse": ["ADMIN", "ACCOUNTANT"],
  "accountant:salary:maintain": ["ACCOUNTANT"],
  "accountant:payroll:generate": ["ACCOUNTANT"],
  "accountant:payroll:submit": ["ACCOUNTANT"],
  "accountant:payroll:markPaid": ["ACCOUNTANT"],

  // === TEACHER: works with own assigned batch, term and subject ===
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

  // === STAFF: views own profile, payslips and attendance, reads notices ===
  "staff:profile:own": ["STAFF"],
  "staff:payslips:own": ["STAFF"],
  "staff:attendance:own": ["STAFF"],
  "staff:notices:read": ["STAFF"],

  // === Cross-role / system ===
  "system:notices:read": ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "TEACHER", "STAFF"],
  "system:notices:create": ["ADMIN"],
  "system:fiscalYear:read": ["ADMIN"],
} as const;

export type PermissionKey = keyof typeof PERMISSION_MAP;

function hasPermission(role: T_Role | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  const allowed: readonly string[] = PERMISSION_MAP[permission];
  return allowed.includes(role as never);
}

export function useCan(permission: PermissionKey): boolean {
  const { user } = useAuth();
  return hasPermission(user?.role, permission);
}

// Minimal <Can> render-prop without pulling in React-router redirect logic:
// renders children only when the current user holds the permission; else renders
// nothing (parent is responsible for checking roles via RequireAuth).
export function Can({
  permission,
  children,
}: {
  permission: PermissionKey;
  children: React.ReactNode;
}) {
  if (useCan(permission)) return <>{children}</>;
  return null;
}

// Render an admin nav item; hidden if the user lacks the permission.
export function NavItem({
  permission,
  label,
  icon,
  href,
  onClick,
}: {
  permission?: PermissionKey;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {permission && !useCan(permission) ? null : null}
      {onClick ? (
        <button
          className={clsx(
            "block rounded px-3 py-1.5 text-sm font-medium hover:bg-muted",
          )}
          onClick={onClick}
        >
          {label}
        </button>
      ) : href ? (
        <a className="block rounded px-3 py-1.5 text-sm font-medium hover:bg-muted" href={href}>
          {label}
        </a>
      ) : null}
    </li>
  );
}