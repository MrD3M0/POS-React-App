import { useAuth } from "@/auth/context/auth-context";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ClipboardList,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  FileText,
  LayoutDashboard,
  BarChart3,
  Receipt,
  BookMarked,
  Wallet,
  ShieldCheck,
  Megaphone,
  ScrollText,
  UserCircle2,
  FileCheck,
  ClipboardSignature,
  Banknote,
  BookText,
  Calculator,
  PieChart,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export interface NavItemType {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission: string;
}

// Sidebar items derived from the permission map.
// Each item is gated by a permission; the layout filters them per role.
export const NAV_ITEMS: NavItemType[] = [
  // Admin
  { key: "users", label: "Users", icon: Users, href: "/admin/users", permission: "admin:users:read" },
  { key: "employees", label: "Employees", icon: UserCircle2, href: "/admin/employees", permission: "admin:employees:read" },
  { key: "students", label: "Students", icon: GraduationCap, href: "/admin/students", permission: "admin:students:read" },
  { key: "courses", label: "Courses", icon: BookOpen, href: "/admin/courses", permission: "admin:courses:read" },
  { key: "batches", label: "Batches", icon: CalendarDays, href: "/admin/batches", permission: "admin:batches:read" },
  { key: "terms", label: "Terms", icon: FileText, href: "/admin/terms", permission: "admin:terms:read" },
  { key: "subjects", label: "Subjects", icon: BookText, href: "/admin/subjects", permission: "admin:subjects:read" },
  { key: "teaching-assignments", label: "Teaching Assignments", icon: ClipboardSignature, href: "/admin/teaching-assignments", permission: "admin:teachingAssignments:read" },
  { key: "fee-structures", label: "Fee Structures", icon: Receipt, href: "/accountant/fee-structures", permission: "accountant:fees:read" },
  { key: "payments", label: "Payments", icon: Banknote, href: "/accountant/payments", permission: "accountant:payments:record" },
  { key: "journal", label: "Journal", icon: ScrollText, href: "/accountant/journal", permission: "accountant:journal:read" },
  { key: "ledgers", label: "Ledgers", icon: BookMarked, href: "/accountant/ledgers", permission: "accountant:journal:read" },
  { key: "payroll", label: "Payroll", icon: Wallet, href: "/accountant/payroll", permission: "accountant:payroll:generate" },
  { key: "payslips", label: "Payslips", icon: Receipt, href: "/accountant/payslips", permission: "accountant:payroll:markPaid" },
  { key: "attendance", label: "Attendance", icon: ClipboardList, href: "/accountant/attendance", permission: "accountant:attendance:read" },

  // Principal
  { key: "principal-attendance", label: "Employee Attendance", icon: ClipboardSignature, href: "/principal/attendance", permission: "principal:attendance:mark" },
  { key: "pending-results", label: "Pending Results", icon: FileCheck, href: "/principal/results/pending", permission: "principal:results:approve" },
  { key: "pending-payroll", label: "Pending Payroll", icon: ClipboardSignature, href: "/principal/payroll/pending", permission: "principal:payroll:approve" },
  { key: "reports", label: "Reports", icon: BarChart3, href: "/principal/reports", permission: "principal:oversight" },
  { key: "publish-notice", label: "Publish Notice", icon: Megaphone, href: "/admin/notices", permission: "principal:notices:publish" },

  // Teacher
  { key: "my-classes", label: "My Classes", icon: Users, href: "/teacher/my-classes", permission: "admin:teachingAssignments:read" },
  { key: "take-attendance", label: "Take Attendance", icon: ClipboardList, href: "/teacher/attendance", permission: "teacher:attendance:take" },
  { key: "exams", label: "Exams", icon: CalendarDays, href: "/teacher/exams", permission: "teacher:exams:create" },
  { key: "marks-entry", label: "Marks Entry", icon: Calculator, href: "/teacher/marks", permission: "teacher:exams:mark" },
  { key: "results", label: "Results", icon: PieChart, href: "/teacher/results", permission: "teacher:results:generate" },
  { key: "add-student", label: "Add Student", icon: GraduationCap, href: "/teacher/students/create", permission: "teacher:students:create" },

  // Staff
  { key: "my-profile", label: "My Profile", icon: UserCircle2, href: "/staff/profile", permission: "staff:profile:own" },
  { key: "my-payslips", label: "My Payslips", icon: Receipt, href: "/staff/payslips", permission: "staff:payslips:own" },
  { key: "my-attendance", label: "My Attendance", icon: ClipboardList, href: "/staff/attendance", permission: "staff:attendance:own" },

  // Cross-role
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", permission: "system:notices:read" },
  { key: "notices", label: "Notices", icon: Megaphone, href: "/notices", permission: "system:notices:read" },
  { key: "settings", label: "Settings", icon: ShieldCheck, href: "/admin/settings", permission: "admin:users:read" },
  { key: "fiscal-years", label: "Fiscal Years", icon: CalendarDays, href: "/admin/fiscal-years", permission: "system:fiscalYear:read" },
  { key: "lookups", label: "Lookups", icon: BookMarked, href: "/admin/lookups", permission: "admin:students:read" },
  { key: "audit-log", label: "Audit Log", icon: ScrollText, href: "/admin/audit", permission: "admin:employees:read" },
];

// Role -> visible menu items
const PERMISSION_BY_ROLE: Record<string, Set<string>> = {
  ADMIN: new Set(NAV_ITEMS.map((i) => i.permission)),
  PRINCIPAL: new Set([
    "admin:students:read", "admin:employees:read", "admin:batches:read",
    "admin:terms:read", "admin:subjects:read", "admin:teachingAssignments:read",
    "principal:attendance:mark", "principal:attendance:correct",
    "principal:results:read", "principal:results:approve", "principal:results:reject",
    "principal:results:publish", "principal:payroll:read", "principal:payroll:approve",
    "principal:payroll:reject", "principal:oversight", "principal:notices:publish",
    "system:notices:read",
  ]),
  ACCOUNTANT: new Set([
    "admin:students:read", "admin:batches:read", "admin:terms:read",
    "admin:subjects:read", "admin:teachingAssignments:read",
    "accountant:fees:read", "accountant:fees:structure:create", "accountant:fees:structure:assign",
    "accountant:payments:record", "accountant:payments:split", "accountant:receipt:print",
    "accountant:receipt:cancel", "accountant:journal:read", "accountant:journal:post",
    "accountant:journal:reverse", "accountant:salary:maintain", "accountant:payroll:generate",
    "accountant:payroll:submit", "accountant:payroll:markPaid", "system:notices:read",
  ]),
  TEACHER: new Set([
    "admin:teachingAssignments:read", "teacher:attendance:take", "teacher:attendance:own",
    "teacher:attendance:percentage", "teacher:students:own", "teacher:students:create",
    "teacher:students:edit", "teacher:exams:create", "teacher:exams:mark",
    "teacher:results:generate", "teacher:results:submit", "teacher:results:own",
    "teacher:notices:read", "system:notices:read",
  ]),
  STAFF: new Set(["staff:profile:own", "staff:payslips:own", "staff:attendance:own", "staff:notices:read", "system:notices:read"]),
};

function visibleFor(role?: string): NavItemType[] {
  if (!role) return [];
  const set = PERMISSION_BY_ROLE[role];
  if (!set) return [];
  return NAV_ITEMS.filter((item) => set.has(item.permission));
}

export default function AppSidebarMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const items = visibleFor(user?.role);
  if (!user?.role) return null;

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {state === "expanded" && (
              <SidebarMenuButton className="w-full flex justify-between">
                <span className="font-semibold">School Management</span>
              </SidebarMenuButton>
            )}
            {!state && (
              <SidebarMenuButton className="w-full justify-center">
                <LayoutDashboard className="h-5 w-5" />
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <SidebarMenuItem key={item.key}>
                  <Link to={item.href} onClick={() => state === "collapsed" && {}}
                    className={isActive ? "bg-sidebar-accent" : ""}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={isActive ? "data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground" : ""}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => { void logout(); }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-log-out"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="10" y1="12" x2="21" y2="12"></line>
              </svg>
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}