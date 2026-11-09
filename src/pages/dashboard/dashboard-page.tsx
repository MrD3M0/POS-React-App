import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import Badge from "@/components/ui/badge";
import AlertHandler from "@/components/common/alert-handler";
import {
  Megaphone,
  GraduationCap,
  Wallet,
  ClipboardList,
  Users,
  Receipt,
  FileCheck,
  CalendarDays,
  BookOpen,
  ScrollText,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/context/auth-context";
import type { T_Role } from "@/lib/models";
import { QUERY_KEYS } from "@/lib/query-keys";
import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { ComponentType } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Helpers (mirror src/pages/principal/reports/index.tsx pattern) ──────────

type Row = Record<string, unknown>;

function getRows(body: unknown): Row[] {
  try {
    if (Array.isArray(body)) return body as Row[];
    const d = (body as { data?: unknown } | undefined)?.data;
    if (Array.isArray(d)) return d as Row[];
    const dd = (d as { data?: unknown } | undefined)?.data;
    if (Array.isArray(dd)) return dd as Row[];
  } catch {
    return [];
  }
  return [];
}

function getTotal(body: unknown): number {
  try {
    if (Array.isArray(body)) return body.length;
    const d = (body as { data?: unknown } | undefined)?.data;
    if (Array.isArray(d)) return d.length;
    const pag = (d as { pagination?: { total?: unknown } } | undefined)?.pagination?.total;
    if (typeof pag === "number") return pag;
    const dd = (d as { data?: unknown } | undefined)?.data;
    if (Array.isArray(dd)) return dd.length;
    const pag2 = (body as { pagination?: { total?: unknown } } | undefined)?.pagination?.total;
    if (typeof pag2 === "number") return pag2;
  } catch {
    return 0;
  }
  return 0;
}

async function fetchList(url: string, params: Record<string, string | number | undefined>) {
  const res = await axiosInstance.get(url, { params });
  return res.data;
}

function asStr(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v;
  if (typeof v === "number") return String(v);
  return "";
}

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return 0;
}

function obj(v: unknown): Row {
  return (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Row;
}

function fullName(row: Row): string {
  const direct = asStr(row.studentName) || asStr(row.employeeName) || asStr(row.name) || asStr(row.fullName);
  if (direct) return direct;
  const parts = [asStr(row.firstName), asStr(row.middleName), asStr(row.lastName)].filter(Boolean);
  if (parts.length) return parts.join(" ");
  const nested = obj(row.student);
  const nestedParts = [asStr(nested.firstName), asStr(nested.middleName), asStr(nested.lastName)].filter(Boolean);
  if (nestedParts.length) return nestedParts.join(" ");
  return asStr(nested.studentName) || asStr(nested.name) || "—";
}

function batchName(row: Row): string {
  const batch = obj(row.batch);
  const course = obj(batch.course);
  return (
    asStr(row.batchName) ||
    asStr(batch.name) ||
    asStr(course.code) ||
    asStr(batch.code) ||
    "—"
  );
}

function regNo(row: Row): string {
  return asStr(row.universityRegNo) || asStr(row.regNo) || asStr(row.registrationNo) || "—";
}

function paymentAmount(row: Row): number {
  return asNum(row.totalAmount) || asNum(row.amountDue) || asNum(row.amount) || asNum(row.paidAmount) || 0;
}

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Shared UI ────────────────────────────────────────────────────────────────

type IconType = ComponentType<{ className?: string }>;

const ROLE_LABELS: Record<T_Role, string> = {
  ADMIN: "Administrator",
  PRINCIPAL: "Principal",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  STAFF: "Staff",
  STUDENT: "Student",
};

const ROLE_ICONS: Record<T_Role, IconType> = {
  ADMIN: Megaphone,
  PRINCIPAL: FileCheck,
  ACCOUNTANT: Wallet,
  TEACHER: GraduationCap,
  STAFF: Users,
  STUDENT: Users,
};

function StatCard({ icon: Icon, label, value, color }: { icon: IconType; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-lg border p-4">
      <Icon className={cn("h-6 w-6 mb-2", color)} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function SectionNotice({ isLoading, isError, label }: { isLoading: boolean; isError: boolean; label: string }) {
  if (isLoading) return <p className="mb-4 text-xs text-muted-foreground">Loading {label}…</p>;
  if (isError) return <AlertHandler variant="error" title="Could not load dashboard data" message={`Some ${label} data is unavailable right now.`} />;
  return null;
}

function BarPanel({ title, data, dataKey, color }: { title: string; data: Array<Record<string, string | number>>; dataKey: string; color: string }) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="font-semibold text-base mb-4">{title}</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Teacher dashboard (student data) ─────────────────────────────────────────

function TeacherSection() {
  const today = new Date().toISOString().slice(0, 10);

  const classesQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-teacher-classes"],
    queryFn: () => fetchList(UrlConstants.TEACHING_ASSIGNMENT_URL, { page: 1, limit: 1 }),
  });
  const studentsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-teacher-students"],
    queryFn: () => fetchList(UrlConstants.STUDENT_URL, { page: 1, limit: 1 }),
  });
  const attendanceQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-teacher-attendance", today],
    queryFn: () => fetchList(UrlConstants.STUDENT_ATTENDANCE_URL, { page: 1, limit: 1, date: today }),
  });
  const examsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-teacher-exams"],
    queryFn: () => fetchList(UrlConstants.EXAM_URL, { page: 1, limit: 1 }),
  });
  const pendingResultsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-teacher-pending-results"],
    queryFn: () => fetchList(UrlConstants.RESULT_URL, { page: 1, limit: 1, status: "PENDING" }),
  });
  const recentStudentsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-teacher-recent-students"],
    queryFn: () => fetchList(UrlConstants.STUDENT_URL, { page: 1, limit: 10 }),
  });

  const isLoading =
    classesQ.isLoading || studentsQ.isLoading || attendanceQ.isLoading || examsQ.isLoading || pendingResultsQ.isLoading || recentStudentsQ.isLoading;
  const isError = classesQ.isError && studentsQ.isError && recentStudentsQ.isError;

  const recentStudents = getRows(recentStudentsQ.data);

  return (
    <div className="mb-6">
      <SectionNotice isLoading={isLoading} isError={isError} label="teacher" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={GraduationCap} label="My Classes" value={getTotal(classesQ.data)} color="text-blue-600" />
        <StatCard icon={Users} label="Total Students" value={getTotal(studentsQ.data)} color="text-green-600" />
        <StatCard icon={ClipboardList} label={`Attendance (${today})`} value={getTotal(attendanceQ.data)} color="text-amber-600" />
        <StatCard icon={CalendarDays} label="Exams" value={getTotal(examsQ.data)} color="text-purple-600" />
        <StatCard icon={FileCheck} label="Pending Results" value={getTotal(pendingResultsQ.data)} color="text-red-600" />
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Recent Students</h3>
          <a href="/teacher/my-classes" className="text-xs font-medium text-primary underline">
            Open My Classes
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Reg No</th>
                <th className="py-2 pr-4 font-medium">Batch</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              ) : (
                recentStudents.map((r, i) => (
                  <tr key={asStr(r.id) || `student-${i}`} className="border-b last:border-0">
                    <td className="py-2 pr-4">{fullName(r)}</td>
                    <td className="py-2 pr-4">{regNo(r)}</td>
                    <td className="py-2 pr-4">{batchName(r)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Accountant dashboard (accounts data) ─────────────────────────────────────

function AccountantSection() {
  const paymentsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-accountant-payments"],
    queryFn: () => fetchList(UrlConstants.FEE_PAYMENT_URL, { page: 1, limit: 100 }),
  });
  const accountsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-accountant-accounts"],
    queryFn: () => fetchList(UrlConstants.ACCOUNT_URL, { page: 1, limit: 1 }),
  });
  const payrollQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-accountant-payroll"],
    queryFn: () => fetchList(UrlConstants.PAYROLL_URL, { page: 1, limit: 1, status: "PENDING" }),
  });
  const journalQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-accountant-journal"],
    queryFn: () => fetchList(UrlConstants.JOURNAL_ENTRY_URL, { page: 1, limit: 5 }),
  });

  const isLoading = paymentsQ.isLoading || accountsQ.isLoading || payrollQ.isLoading || journalQ.isLoading;
  const isError = paymentsQ.isError && accountsQ.isError && payrollQ.isError && journalQ.isError;

  const paymentRows = getRows(paymentsQ.data);
  const collected = paymentRows.reduce((sum, r) => sum + paymentAmount(r), 0);
  const chartData = paymentRows.slice(0, 5).map((r, i) => ({
    name: asStr(r.receiptNo) || fullName(r).slice(0, 14) || `Payment ${i + 1}`,
    amount: paymentAmount(r),
  }));

  return (
    <div className="mb-6">
      <SectionNotice isLoading={isLoading} isError={isError} label="accountant" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Wallet} label="Collected" value={formatMoney(collected)} color="text-green-600" />
        <StatCard icon={Receipt} label="Payment Records" value={getTotal(paymentsQ.data)} color="text-blue-600" />
        <StatCard icon={BookOpen} label="Chart Accounts" value={getTotal(accountsQ.data)} color="text-purple-600" />
        <StatCard icon={ClipboardList} label="Pending Payroll" value={getTotal(payrollQ.data)} color="text-amber-600" />
        <StatCard icon={ScrollText} label="Journal Entries" value={getTotal(journalQ.data)} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold text-sm">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-4 font-medium">Receipt No</th>
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.slice(0, 5).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  paymentRows.slice(0, 5).map((r, i) => (
                    <tr key={asStr(r.id) || `payment-${i}`} className="border-b last:border-0">
                      <td className="py-2 pr-4">{asStr(r.receiptNo) || "—"}</td>
                      <td className="py-2 pr-4">{fullName(r)}</td>
                      <td className="py-2 pr-4 tabular-nums">{formatMoney(paymentAmount(r))}</td>
                      <td className="py-2 text-muted-foreground">
                        {asStr(r.createdAt) || asStr(r.paidDate) || asStr(r.date) || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <BarPanel title="Last 5 Payments by Amount" data={chartData} dataKey="amount" color="#198754" />
      </div>
    </div>
  );
}

// ── Principal dashboard (tracking account and employees) ─────────────────────

function PrincipalSection() {
  const pendingStudentsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-principal-pending-students"],
    queryFn: () => fetchList(UrlConstants.STUDENT_URL, { page: 1, limit: 5, approvalStatus: "PENDING" }),
  });
  const pendingResultsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-principal-pending-results"],
    queryFn: () => fetchList(UrlConstants.RESULT_URL, { page: 1, limit: 5, status: "PENDING" }),
  });
  const pendingPayrollQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-principal-pending-payroll"],
    queryFn: () => fetchList(UrlConstants.PAYROLL_URL, { page: 1, limit: 5, status: "PENDING" }),
  });
  const employeesQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-principal-employees"],
    queryFn: () => fetchList(UrlConstants.EMPLOYEE_URL, { page: 1, limit: 1 }),
  });
  const presentQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-principal-present"],
    queryFn: () => fetchList(UrlConstants.EMPLOYEE_ATTENDANCE_URL, { page: 1, limit: 1, status: "PRESENT" }),
  });

  const isLoading =
    pendingStudentsQ.isLoading || pendingResultsQ.isLoading || pendingPayrollQ.isLoading || employeesQ.isLoading || presentQ.isLoading;
  const isError = pendingStudentsQ.isError && pendingResultsQ.isError && pendingPayrollQ.isError && employeesQ.isError;

  const chartData = [
    { name: "Pending Students", value: getTotal(pendingStudentsQ.data) },
    { name: "Pending Results", value: getTotal(pendingResultsQ.data) },
    { name: "Pending Payroll", value: getTotal(pendingPayrollQ.data) },
    { name: "Employees", value: getTotal(employeesQ.data) },
    { name: "Present", value: getTotal(presentQ.data) },
  ];

  return (
    <div className="mb-6">
      <SectionNotice isLoading={isLoading} isError={isError} label="principal" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Megaphone} label="Pending Students" value={getTotal(pendingStudentsQ.data)} color="text-amber-600" />
        <StatCard icon={FileCheck} label="Pending Results" value={getTotal(pendingResultsQ.data)} color="text-blue-600" />
        <StatCard icon={Wallet} label="Pending Payroll" value={getTotal(pendingPayrollQ.data)} color="text-green-600" />
        <StatCard icon={Users} label="Employees" value={getTotal(employeesQ.data)} color="text-purple-600" />
        <StatCard icon={ClipboardList} label="Present (Employee Attendance)" value={getTotal(presentQ.data)} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold text-sm">Pending Students</h3>
          {getRows(pendingStudentsQ.data).length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending students.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {getRows(pendingStudentsQ.data).map((r, i) => (
                <li key={asStr(r.id) || `ps-${i}`} className="flex items-center justify-between gap-2">
                  <span>{fullName(r)}</span>
                  <span className="text-xs text-muted-foreground">{regNo(r)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold text-sm">Pending Results</h3>
          {getRows(pendingResultsQ.data).length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending results.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {getRows(pendingResultsQ.data).map((r, i) => (
                <li key={asStr(r.id) || `pr-${i}`} className="flex items-center justify-between gap-2">
                  <span>{asStr(r.examName) || fullName(r)}</span>
                  <span className="text-xs text-muted-foreground">{asStr(r.status) || "PENDING"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold text-sm">Pending Payroll</h3>
          {getRows(pendingPayrollQ.data).length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending payroll.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {getRows(pendingPayrollQ.data).map((r, i) => (
                <li key={asStr(r.id) || `pp-${i}`} className="flex items-center justify-between gap-2">
                  <span>{asStr(r.employeeName) || fullName(r)}</span>
                  <span className="text-xs text-muted-foreground">{asStr(r.month) || asStr(r.status) || "PENDING"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <BarPanel title="Tracking Summary" data={chartData} dataKey="value" color="#198754" />
    </div>
  );
}

// ── Staff / Admin dashboards (simple live counts) ────────────────────────────

function StaffSection() {
  const payslipsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-staff-payslips"],
    queryFn: () => fetchList(UrlConstants.PAYSLIP_URL, { page: 1, limit: 1 }),
  });
  const attendanceQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-staff-attendance"],
    queryFn: () => fetchList(UrlConstants.EMPLOYEE_ATTENDANCE_URL, { page: 1, limit: 1 }),
  });

  const isLoading = payslipsQ.isLoading || attendanceQ.isLoading;
  const isError = payslipsQ.isError && attendanceQ.isError;

  return (
    <div className="mb-6">
      <SectionNotice isLoading={isLoading} isError={isError} label="staff" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Receipt} label="My Payslips" value={getTotal(payslipsQ.data)} color="text-blue-600" />
        <StatCard icon={ClipboardList} label="My Attendance Records" value={getTotal(attendanceQ.data)} color="text-green-600" />
      </div>
    </div>
  );
}

function AdminSection() {
  const employeesQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-admin-employees"],
    queryFn: () => fetchList(UrlConstants.EMPLOYEE_URL, { page: 1, limit: 1 }),
  });
  const studentsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-admin-students"],
    queryFn: () => fetchList(UrlConstants.STUDENT_URL, { page: 1, limit: 1 }),
  });
  const paymentsQ = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER, "dashboard-admin-payments"],
    queryFn: () => fetchList(UrlConstants.FEE_PAYMENT_URL, { page: 1, limit: 1 }),
  });

  const isLoading = employeesQ.isLoading || studentsQ.isLoading || paymentsQ.isLoading;
  const isError = employeesQ.isError && studentsQ.isError && paymentsQ.isError;

  return (
    <div className="mb-6">
      <SectionNotice isLoading={isLoading} isError={isError} label="admin" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Employees" value={getTotal(employeesQ.data)} color="text-blue-600" />
        <StatCard icon={GraduationCap} label="Students" value={getTotal(studentsQ.data)} color="text-green-600" />
        <StatCard icon={Wallet} label="Fee Payments" value={getTotal(paymentsQ.data)} color="text-amber-600" />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className="p-5">
      <PageHeader title="Dashboard" breadCrumbItems={[{ title: "Home", link: "/dashboard" }]} />

      {/* Role banner */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          {(() => {
            const I = ROLE_ICONS[role ?? "STAFF"];
            return <I className="h-8 w-8 text-primary" />;
          })()}
          <span className="font-semibold text-base">{user?.email ?? ""}</span>
        </div>
        <Badge variant="outline">{ROLE_LABELS[role ?? "STAFF"]}</Badge>
      </div>

      {/* Role-specific live dashboard */}
      {role === "TEACHER" && <TeacherSection />}
      {role === "ACCOUNTANT" && <AccountantSection />}
      {role === "PRINCIPAL" && <PrincipalSection />}
      {role === "STAFF" && <StaffSection />}
      {role === "ADMIN" && <AdminSection />}
      {(role === "STUDENT" || !role) && (
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          Welcome. Use the quick links below to view your details.
        </div>
      )}

      {/* Quick links per role */}
      <RoleQuickLinks role={role} />
    </div>
  );
}

function RoleQuickLinks({ role }: { role?: T_Role }) {
  if (!role) return null;
  const links: { key: string; label: string; href: string; icon: IconType }[] = [];

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
    default:
      break;
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 font-semibold text-sm">Quick Links</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a key={link.key} href={link.href}>
              <button className="flex items-center gap-2 rounded px-3 py-1 text-sm font-medium hover:bg-primary/10">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {link.label}
              </button>
            </a>
          );
        })}
      </div>
    </div>
  );
}
