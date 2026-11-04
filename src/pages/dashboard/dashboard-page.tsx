import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import { Megaphone, GraduationCap, Wallet, ClipboardList, Users, Receipt, FileCheck, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/context/auth-context";
import type { T_ROLE } from "@/lib/models";

interface DashboardData {
  data: {
    pendingStudents?: number;
    pendingResults?: number;
    pendingPayrolls?: number;
  };
  meta: { timestamp: string };
}

const ROLE_LABELS: Record<T_ROLE, string> = {
  ADMIN: "Administrator",
  PRINCIPAL: "Principal",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  STAFF: "Staff",
};

const ROLE_ICONS: Record<T_ROLE, React.ComponentType<{ className?: string }>> = {
  ADMIN: Megaphone,
  PRINCIPAL: FileCheck,
  ACCOUNTANT: Wallet,
  TEACHER: GraduationCap,
  STAFF: Users,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pendingStudents: 0, pendingResults: 0, pendingPayrolls: 0 });

  useEffect(() => {
    setStats({ pendingStudents: 0, pendingResults: 0, pendingPayrolls: 0 });
  }, [user?.role]);

  return (
    <div className="p-5">
      <PageHeader title="Dashboard" breadCrumbItems={[{ title: "Home", link: "/dashboard" }]} />

      {/* Role banner */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          {(() => { const I = ROLE_ICONS[user?.role ?? "STAFF"]; return <I className="h-8 w-8 text-primary" />; })()}
          <span className="font-semibold text-base">{user?.email ?? ""}</span>
        </div>
        <Badge variant="outline">{ROLE_LABELS[user?.role ?? "STAFF"]}</Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Megaphone} label="Pending Students" value={stats.pendingStudents} color="text-amber-600" />
        <StatCard icon={FileCheck} label="Pending Results" value={stats.pendingResults} color="text-blue-600" />
        <StatCard icon={Wallet} label="Pending Payroll" value={stats.pendingPayrolls} color="text-green-600" />
      </div>

      {/* Quick links per role */}
      <RoleQuickLinks user={user?.role} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border p-4">
      <Icon className={cn("h-6 w-6 mb-2", color)} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function RoleQuickLinks({ role }: { role?: T_ROLE }) {
  if (!role) return null;
  const links: { key: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];

  switch (role) {
    case "ADMIN":
      links.push({ key: "pending-students", label: "Pending Students", href: "/admin/students?status=PENDING", icon: GraduationCap });
      links.push({ key: "employees", label: "Employees", href: "/admin/employees", icon: Users });
      links.push({ key: "batches", label: "Academic Structure", href: "/admin/batches", icon: CalendarDays });
      links.push({ key: "lookups", label: "Lookups", href: "/admin/lookups", icon: BookOpen });
      links.push({ key: "fiscal-years", label: "Fiscal Years", href: "/admin/fiscal-years", icon: Receipt });
      break;
    case "PRINCIPAL":
      links.push({ key: "pending-results", label: "Pending Results", href: "/principal/results/pending", icon: FileCheck });
      links.push({ key: "attendance", label: "Employee Attendance", href: "/principal/attendance", icon: ClipboardList });
      links.push({ key: "pending-payroll", label: "Pending Payroll", href: "/principal/payroll/pending", icon: Wallet });
      links.push({ key: "reports", label: "Reports", href: "/principal/reports", icon: Receipt });
      break;
    case "ACCOUNTANT":
      links.push({ key: "fee-structures", label: "Fee Structures", href: "/accountant/fee-structures", icon: Receipt });
      links.push({ key: "payments", label: "Student Payments", href: "/accountant/payments", icon: Wallet });
      links.push({ key: "journal", label: "Journal Entries", href: "/accountant/journal", icon: ScrollText });
      links.push({ key: "payroll", label: "Payroll Wizard", href: "/accountant/payroll/wizard", icon: ClipboardList });
      break;
    case "TEACHER":
      links.push({ key: "my-classes", label: "My Classes", href: "/teacher/my-classes", icon: GraduationCap });
      links.push({ key: "take-attendance", label: "Take Attendance", href: "/teacher/take-attendance", icon: ClipboardList });
      links.push({ key: "exams", label: "Exams", href: "/teacher/exams", icon: CalendarDays });
      break;
    case "STAFF":
      links.push({ key: "profile", label: "My Profile", href: "/staff/profile", icon: UserCircle2 });
      links.push({ key: "payslips", label: "My Payslips", href: "/staff/payslips", icon: Receipt });
      links.push({ key: "attendance", label: "My Attendance", href: "/staff/attendance", icon: ClipboardList });
      break;
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 font-semibold text-sm">Quick Links</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => { const Icon = link.icon; return (
          <a key={link.key} href={link.href}>
            <button className="flex items-center gap-2 rounded px-3 py-1 text-sm font-medium hover:bg-primary/10"><Icon className="h-4 w-4 text-muted-foreground" />{link.label}</button>
          </a>
        )})}
      </div>
    </div>
  );
}

import { CalendarDays, BookOpen, ScrollText, UserCircle2 } from "lucide-react";
