import {
  Banknote,
  BarChart3,
  BookMarked,
  BookOpen,
  BookText,
  Calculator,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  ClipboardSignature,
  FileCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  PieChart,
  Receipt,
  ScrollText,
  ShieldCheck,
  UploadCloud,
  UserCircle2,
  Users,
  Wallet,
} from "lucide-react";

export type NavIcon = React.ComponentType<{ className?: string }>;

export interface NavItemType {
  key: string;
  label: string;
  icon: NavIcon;
  href: string;
  permission: string;
}

export interface NavGroupType {
  key: string;
  label: string;
  icon: NavIcon;
  /** NAV_ITEMS keys that belong to this module. */
  itemKeys: string[];
}

export const NAV_ITEMS: NavItemType[] = [
  // One dashboard entry per role, each pointed at that role's own route.
  {
    key: "admin-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    permission: "admin:dashboard:read",
  },
  {
    key: "principal-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/principal",
    permission: "principal:dashboard:read",
  },
  {
    key: "accountant-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/accountant",
    permission: "accountant:dashboard:read",
  },
  {
    key: "teacher-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
    permission: "teacher:dashboard:read",
  },
  {
    key: "staff-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/staff",
    permission: "staff:dashboard:read",
  },

  // Admin Modules
  {
    key: "users",
    label: "Users",
    icon: Users,
    href: "/admin/users",
    permission: "admin:users:read",
  },
  {
    key: "employees",
    label: "Employees",
    icon: UserCircle2,
    href: "/admin/employees",
    permission: "admin:employees:read",
  },
  {
    key: "students",
    label: "Students",
    icon: GraduationCap,
    href: "/admin/students",
    permission: "admin:students:read",
  },
  {
    key: "courses",
    label: "Courses",
    icon: BookOpen,
    href: "/admin/courses",
    permission: "admin:courses:read",
  },
  {
    key: "batches",
    label: "Batches",
    icon: CalendarDays,
    href: "/admin/batches",
    permission: "admin:batches:read",
  },
  {
    key: "terms",
    label: "Terms",
    icon: FileText,
    href: "/admin/terms",
    permission: "admin:terms:read",
  },
  {
    key: "subjects",
    label: "Subjects",
    icon: BookText,
    href: "/admin/subjects",
    permission: "admin:subjects:read",
  },
  {
    key: "teaching-assignments",
    label: "Teaching Assignments",
    icon: ClipboardSignature,
    href: "/admin/teaching-assignments",
    permission: "admin:teachingAssignments:read",
  },
  {
    key: "lookups",
    label: "Lookups",
    icon: BookMarked,
    href: "/admin/lookups",
    permission: "admin:lookups:read",
  },
  {
    key: "holidays",
    label: "Holidays",
    icon: CalendarDays,
    href: "/admin/holidays",
    permission: "admin:holidays:read",
  },
  {
    key: "fiscal-years",
    label: "Fiscal years",
    icon: CalendarDays,
    href: "/admin/fiscal-years",
    permission: "system:fiscalYear:read",
  },
  {
    key: "notices",
    label: "Notices",
    icon: Megaphone,
    href: "/admin/notices",
    permission: "admin:notices:read",
  },
  {
    key: "audit",
    label: "Audit log",
    icon: ScrollText,
    href: "/admin/audit",
    permission: "admin:audit:read",
  },
  {
    key: "settings",
    label: "Settings",
    icon: ShieldCheck,
    href: "/admin/settings",
    permission: "admin:settings:read",
  },

  // Accountant Modules
  {
    key: "fee-structures",
    label: "Fee Structures",
    icon: Receipt,
    href: "/accountant/fee-structures",
    permission: "accountant:fees:read",
  },
  {
    key: "billing",
    label: "Student Fees",
    icon: Receipt,
    href: "/accountant/billing",
    permission: "accountant:payments:record",
  },
  {
    key: "fee-payments",
    label: "Fee Payments",
    icon: Banknote,
    href: "/accountant/billing/payments",
    permission: "accountant:payments:record",
  },
  {
    key: "fee-installments",
    label: "Installments",
    icon: CalendarDays,
    href: "/accountant/billing/installments",
    permission: "accountant:fees:read",
  },
  {
    key: "payments",
    label: "Payments",
    icon: Banknote,
    href: "/accountant/payments",
    permission: "accountant:payments:record",
  },
  {
    key: "journal",
    label: "Journal",
    icon: ScrollText,
    href: "/accountant/journal",
    permission: "accountant:journal:read",
  },
  {
    key: "ledgers",
    label: "Ledgers",
    icon: BookMarked,
    href: "/accountant/ledgers",
    permission: "accountant:journal:read",
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: Wallet,
    href: "/accountant/payroll",
    permission: "accountant:payroll:generate",
  },
  {
    key: "payslips",
    label: "Payslips",
    icon: Receipt,
    href: "/accountant/payslips",
    permission: "accountant:payroll:markPaid",
  },
  {
    key: "accountants",
    label: "Accountants",
    icon: Users,
    href: "/accountant/accountants",
    permission: "admin:employees:read",
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: ClipboardList,
    href: "/accountant/attendance",
    permission: "accountant:attendance:read",
  },

  // Principal Modules
  {
    key: "principal-attendance",
    label: "Employee Attendance",
    icon: ClipboardSignature,
    href: "/principal/attendance",
    permission: "principal:attendance:mark",
  },
  {
    key: "pending-results",
    label: "Pending Results",
    icon: FileCheck,
    href: "/principal/results/pending",
    permission: "principal:results:approve",
  },
  {
    key: "publish-results",
    label: "Publish Results",
    icon: FileCheck,
    href: "/principal/results/publish",
    permission: "principal:results:publish",
  },
  {
    key: "student-approval",
    label: "Student Approval",
    icon: GraduationCap,
    href: "/principal/students/approval",
    permission: "admin:students:read",
  },
  {
    key: "principal-notices",
    label: "Notices",
    icon: Megaphone,
    href: "/principal/notices",
    permission: "principal:notices:publish",
  },
  {
    key: "pending-payroll",
    label: "Pending Payroll",
    icon: ClipboardSignature,
    href: "/principal/payroll/pending",
    permission: "principal:payroll:approve",
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/principal/reports",
    permission: "principal:oversight",
  },

  // Teacher Modules
  {
    key: "my-classes",
    label: "My Classes",
    icon: Users,
    href: "/teacher/my-classes",
    permission: "teacher:classes:read",
  },
  {
    key: "take-attendance",
    label: "Take Attendance",
    icon: ClipboardList,
    href: "/teacher/take-attendance",
    permission: "teacher:attendance:take",
  },
  {
    key: "exams",
    label: "Exams",
    icon: CalendarDays,
    href: "/teacher/exams",
    permission: "teacher:exams:create",
  },
  {
    key: "marks-entry",
    label: "Marks Entry",
    icon: Calculator,
    href: "/teacher/marks",
    permission: "teacher:exams:mark",
  },
  {
    key: "marks-submit",
    label: "Marks Submission",
    icon: UploadCloud,
    href: "/teacher/marks/submit",
    permission: "teacher:results:submit",
  },
  {
    key: "results",
    label: "Results",
    icon: PieChart,
    href: "/teacher/results",
    permission: "teacher:results:generate",
  },
  {
    key: "exam-subjects",
    label: "Exam Subjects",
    icon: BookText,
    href: "/teacher/exam-subjects",
    permission: "teacher:examSubjects:read",
  },
  {
    key: "attendance-sessions",
    label: "Attendance Sessions",
    icon: ClipboardList,
    href: "/teacher/attendance-sessions",
    permission: "teacher:attendanceSessions:read",
  },
  {
    // Teachers: read-only view of their own batch pays.
    key: "batch-pay",
    label: "Batch Pay",
    icon: Wallet,
    href: "/teacher/batch-pay",
    permission: "teacher:batchPay:read",
  },
  {
    // Admin/Accountant: create and edit batch pays (feeds payroll).
    key: "batch-pay-manage",
    label: "Batch Pay",
    icon: Wallet,
    href: "/accountant/batch-pay",
    permission: "teacher:batchPay:manage",
  },
  {
    key: "teacher-notices",
    label: "Notices",
    icon: Megaphone,
    href: "/teacher/notices",
    permission: "teacher:notices:read",
  },
  {
    key: "accountant-notices",
    label: "Notices",
    icon: Megaphone,
    href: "/accountant/notices",
    permission: "accountant:notices:manage",
  },
  {
    key: "scholarships",
    label: "Scholarships",
    icon: GraduationCap,
    href: "/accountant/scholarships",
    permission: "scholarship:read",
  },
  {
    key: "teacher-students",
    label: "Students",
    icon: GraduationCap,
    href: "/teacher/students",
    permission: "teacher:students:own",
  },

  // Staff Modules
  {
    key: "my-profile",
    label: "My Profile",
    icon: UserCircle2,
    href: "/staff/profile",
    permission: "staff:profile:own",
  },
  {
    key: "edit-profile",
    label: "Edit Profile",
    icon: UserCircle2,
    href: "/staff/profile/edit",
    permission: "staff:profile:own",
  },
  {
    key: "my-payslips",
    label: "My Payslips",
    icon: Receipt,
    href: "/staff/payslips",
    permission: "staff:payslips:own",
  },
  {
    key: "my-attendance",
    label: "My Attendance",
    icon: ClipboardList,
    href: "/staff/attendance",
    permission: "staff:attendance:own",
  },
  {
    key: "my-leave",
    label: "My Leave",
    icon: CalendarDays,
    href: "/staff/leave",
    permission: "staff:attendance:own",
  },
  {
    key: "staff-notices",
    label: "Notices",
    icon: Megaphone,
    href: "/staff/notices",
    permission: "staff:notices:read",
  },
  {
    key: "help",
    label: "Help",
    icon: CircleHelp,
    href: "/help",
    permission: "system:help:read",
  },
];

// Modules that contain more than one page. A module only becomes a dropdown
// when the current role can actually see 2+ of its pages.
export const NAV_GROUPS: NavGroupType[] = [
  {
    key: "people",
    label: "People",
    icon: Users,
    itemKeys: ["users", "employees", "accountants"],
  },
  {
    key: "students",
    label: "Students",
    icon: GraduationCap,
    itemKeys: ["students", "student-approval", "teacher-students"],
  },
  {
    key: "academics",
    label: "Academics",
    icon: BookOpen,
    itemKeys: [
      "courses",
      "batches",
      "terms",
      "subjects",
      "teaching-assignments",
      "lookups",
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: ClipboardList,
    itemKeys: [
      "take-attendance",
      "attendance-sessions",
      "my-attendance",
      "principal-attendance",
      "attendance",
    ],
  },
  {
    key: "exams",
    label: "Exams",
    icon: CalendarDays,
    itemKeys: ["exams", "exam-subjects", "marks-entry", "marks-submit"],
  },
  {
    key: "results",
    label: "Results",
    icon: PieChart,
    itemKeys: ["results", "pending-results", "publish-results"],
  },
  {
    key: "finance",
    label: "Finance",
    icon: Receipt,
    itemKeys: [
      "fee-structures",
      "billing",
      "fee-payments",
      "fee-installments",
      "payments",
      "journal",
      "ledgers",
      "scholarships",
    ],
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: Wallet,
    itemKeys: [
      "payroll",
      "payslips",
      "pending-payroll",
      "batch-pay",
      "batch-pay-manage",
    ],
  },
  {
    key: "notices",
    label: "Notices",
    icon: Megaphone,
    itemKeys: [
      "notices",
      "principal-notices",
      "accountant-notices",
      "teacher-notices",
      "staff-notices",
    ],
  },
  {
    key: "system",
    label: "System",
    icon: ShieldCheck,
    itemKeys: ["holidays", "fiscal-years", "settings", "audit"],
  },
  {
    key: "profile",
    label: "My Profile",
    icon: UserCircle2,
    itemKeys: ["my-profile", "edit-profile"],
  },
];

const GROUP_BY_ITEM_KEY = new Map<string, NavGroupType>();
for (const group of NAV_GROUPS) {
  for (const key of group.itemKeys) GROUP_BY_ITEM_KEY.set(key, group);
}

// Role -> visible menu items
const PERMISSION_BY_ROLE: Record<string, Set<string>> = {
  ADMIN: new Set([
    "admin:dashboard:read",
    "system:help:read",
    "admin:users:read",
    "admin:employees:read",
    "admin:students:read",
    "admin:courses:read",
    "admin:batches:read",
    "admin:terms:read",
    "admin:subjects:read",
    "admin:teachingAssignments:read",
    "admin:lookups:read",
    "admin:holidays:read",
    "system:fiscalYear:read",
    "admin:notices:read",
    "admin:audit:read",
    "admin:settings:read",
    // Admin manages batch pays (payroll input).
    "teacher:batchPay:manage",
    // Scholarships: the admin may also grant them.
    "scholarship:read",
    "scholarship:manage",
  ]),
  PRINCIPAL: new Set([
    "principal:dashboard:read",
    "system:help:read",
    "admin:students:read",
    "admin:employees:read",
    "admin:batches:read",
    "admin:terms:read",
    "admin:subjects:read",
    "admin:teachingAssignments:read",
    "principal:attendance:mark",
    "principal:attendance:correct",
    "principal:results:read",
    "principal:results:approve",
    "principal:results:reject",
    "principal:results:publish",
    "principal:payroll:read",
    "principal:payroll:approve",
    "principal:payroll:reject",
    "principal:oversight",
    "principal:notices:publish",
    "admin:notices:read",
    // The principal may look at the scholarships that were granted.
    "scholarship:read",
  ]),
  ACCOUNTANT: new Set([
    "accountant:dashboard:read",
    "system:help:read",
    "admin:students:read",
    "admin:batches:read",
    "admin:terms:read",
    "admin:subjects:read",
    "admin:teachingAssignments:read",
    "accountant:fees:read",
    "accountant:fees:structure:create",
    "accountant:fees:structure:assign",
    "accountant:payments:record",
    "accountant:payments:split",
    "accountant:receipt:print",
    "accountant:receipt:cancel",
    "accountant:journal:read",
    "accountant:journal:post",
    "accountant:journal:reverse",
    "accountant:salary:maintain",
    "accountant:payroll:generate",
    "accountant:payroll:submit",
    "accountant:payroll:markPaid",
    // Accountant manages batch pays (payroll input).
    "teacher:batchPay:manage",
    // Accountant may create notices for everybody or for selected groups.
    "accountant:notices:manage",
    // Scholarships: the accountant grants them, the principal may only look.
    "scholarship:read",
    "scholarship:manage",
  ]),
  TEACHER: new Set([
    // Teachers get their own dashboard instead of the generic one.
    "teacher:dashboard:read",
    "system:help:read",
    // "My Classes" (own teaching assignments) — the admin page that manages
    // every teacher's assignments stays out of the teacher sidebar.
    "teacher:classes:read",
    "teacher:attendance:take",
    "teacher:attendance:own",
    "teacher:attendance:percentage",
    "teacher:students:own",
    "teacher:students:create",
    "teacher:students:edit",
    "teacher:exams:create",
    "teacher:exams:mark",
    "teacher:results:generate",
    "teacher:results:submit",
    "teacher:results:own",
    "teacher:examSubjects:read",
    "teacher:attendanceSessions:read",
    "teacher:batchPay:read",
    "teacher:notices:read",
  ]),
  STAFF: new Set([
    "staff:dashboard:read",
    "system:help:read",
    "staff:profile:own",
    "staff:payslips:own",
    "staff:attendance:own",
    "staff:notices:read",
  ]),
};

/**
 * Nav keys that must always sit at the very top of the sidebar, whichever
 * role is signed in (every role has exactly one dashboard).
 */
const DASHBOARD_KEYS = new Set([
  "admin-dashboard",
  "principal-dashboard",
  "accountant-dashboard",
  "teacher-dashboard",
  "staff-dashboard",
]);

function withDashboardFirst(items: NavItemType[]): NavItemType[] {
  const dashboards = items.filter((item) => DASHBOARD_KEYS.has(item.key));
  if (dashboards.length === 0) return items;
  const rest = items.filter((item) => !DASHBOARD_KEYS.has(item.key));
  return [...dashboards, ...rest];
}

export function visibleFor(role?: string): NavItemType[] {
  if (!role) return [];
  const set = PERMISSION_BY_ROLE[role];
  if (!set) return [];
  return withDashboardFirst(
    NAV_ITEMS.filter((item) => set.has(item.permission)),
  );
}

export type T_NavEntry =
  | { type: "item"; item: NavItemType }
  | { type: "group"; group: NavGroupType; items: NavItemType[] };

/**
 * Preserves NAV_ITEMS order, but folds module pages into a single dropdown
 * entry when the role can see more than one page of that module.
 */
export function buildNav(role?: string): T_NavEntry[] {
  const visible = visibleFor(role);
  const byKey = new Map(visible.map((item) => [item.key, item]));
  const emittedGroups = new Set<string>();
  const entries: T_NavEntry[] = [];

  for (const item of visible) {
    const group = GROUP_BY_ITEM_KEY.get(item.key);
    if (!group) {
      entries.push({ type: "item", item });
      continue;
    }
    if (emittedGroups.has(group.key)) continue;
    emittedGroups.add(group.key);

    const items = group.itemKeys
      .map((key) => byKey.get(key))
      .filter((candidate): candidate is NavItemType => Boolean(candidate));

    entries.push(
      items.length >= 2
        ? { type: "group", group, items }
        : { type: "item", item },
    );
  }

  return entries;
}

export function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Flat list of the pages a role can reach (used by the command palette). */
export function flattenNav(
  role?: string,
): { label: string; href: string; group: string }[] {
  return buildNav(role).flatMap((entry) =>
    entry.type === "item"
      ? [{ label: entry.item.label, href: entry.item.href, group: "Pages" }]
      : // `entry.items` holds only the pages this role may see.
        entry.items.map((item) => ({
          label: item.label,
          href: item.href,
          group: entry.group.label,
        })),
  );
}
