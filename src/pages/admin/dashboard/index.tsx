import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ClipboardSignature,
  GraduationCap,
  Receipt,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { useRoleDashboard } from "@/pages/dashboard/hooks/use-role-dashboard";
import {
  ActionList,
  DashboardPanel,
  MiniBarChart,
  QuickLinks,
  RoleKpi,
} from "@/pages/dashboard/components/dashboard-widgets";

type T_AdminDashboard = {
  todayBs: string | null;
  counts: {
    activeStudents: number;
    pendingStudents: number;
    courses: number;
    activeBatches: number;
    users: number;
    employees: {
      total: number;
      principals: number;
      teachers: number;
      accountants: number;
      staff: number;
    };
  };
  pendingStudents: {
    id: string;
    name: string;
    universityRegNo: string;
    batch: string;
    course: string;
    createdAt: string | null;
  }[];
  charts: {
    studentsPerBatch: {
      batchId: string;
      batch: string;
      course: string;
      count: number;
    }[];
    studentsPerCourse: { course: string; count: number }[];
  };
  recentUsers: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string | null;
  }[];
  recentStudents: {
    id: string;
    name: string;
    universityRegNo: string;
    batch: string;
    createdAt: string | null;
  }[];
  recentAudit: {
    id: string;
    entity: string;
    action: string;
    userId: string | null;
    createdAt: string | null;
  }[];
  warnings: {
    key: string;
    label: string;
    count: number;
    severity: "info" | "warning" | "error";
    link: string;
  }[];
};

const QUICK_LINKS = [
  { key: "batches", label: "Batches", href: "/admin/batches", icon: CalendarDays },
  { key: "courses", label: "Courses", href: "/admin/courses", icon: BookOpen },
  { key: "terms", label: "Terms", href: "/admin/terms", icon: CalendarDays },
  { key: "subjects", label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  {
    key: "assignments",
    label: "Teaching assignments",
    href: "/admin/teaching-assignments",
    icon: ClipboardSignature,
  },
  { key: "holidays", label: "Holidays", href: "/admin/holidays", icon: CalendarDays },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export default function AdminDashboardPage() {
  const query = useRoleDashboard<T_AdminDashboard>("admin");
  const data = query.data;
  const loading = query.isLoading;
  const error = query.isError;
  const retry = () => void query.refetch();

  return (
    <div className="p-5">
      <PageHeader
        title="Admin Dashboard"
        description="Setup health, approvals and the latest activity of the college."
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Dashboard", link: "/admin" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={retry} loading={query.isFetching}>
            {!query.isFetching ? <RefreshCw className="size-3.5" /> : null}
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <RoleKpi
          title="Active students"
          value={data?.counts.activeStudents ?? 0}
          helper={`${data?.counts.pendingStudents ?? 0} pending approval`}
          icon={GraduationCap}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Employees"
          value={data?.counts.employees.total ?? 0}
          helper={`${data?.counts.employees.teachers ?? 0} teachers · ${data?.counts.employees.staff ?? 0} staff`}
          icon={Users}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Courses"
          value={data?.counts.courses ?? 0}
          icon={BookOpen}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Active batches"
          value={data?.counts.activeBatches ?? 0}
          icon={CalendarDays}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Users"
          value={data?.counts.users ?? 0}
          icon={ShieldAlert}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Pending students"
          value={data?.counts.pendingStudents ?? 0}
          helper="Waiting for admin approval"
          icon={ClipboardSignature}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardPanel
          title="Students per batch"
          description="Class size of every batch."
          className="lg:col-span-2"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.charts.studentsPerBatch.length ?? 0) === 0}
          emptyTitle="No batches yet"
          emptyDescription="Create a batch and add students to see class sizes."
        >
          <MiniBarChart
            data={data?.charts.studentsPerBatch ?? []}
            xKey="batch"
            series={[{ key: "count", label: "Students", color: "#2563eb" }]}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Needs your action"
          description="Fix these to keep the setup healthy."
          isLoading={loading}
          isError={error}
          onRetry={retry}
        >
          <ActionList
            items={[
              ...(data?.counts.pendingStudents
                ? [
                    {
                      key: "pending-students",
                      label: "Students waiting for approval",
                      href: "/admin/students?approvalStatus=PENDING",
                      count: data.counts.pendingStudents,
                      severity: "warning" as const,
                    },
                  ]
                : []),
              ...(data?.warnings ?? []).map((warning) => ({
                key: warning.key,
                label: warning.label,
                href: warning.link,
                count: warning.count,
                severity: warning.severity,
              })),
            ]}
          />
        </DashboardPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardPanel
          title="Pending student approvals"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.pendingStudents.length ?? 0) === 0}
          emptyTitle="No pending approvals"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/students?approvalStatus=PENDING">View all</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {data?.pendingStudents.map((student) => (
              <li key={student.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.universityRegNo} · {student.batch} · {student.course}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/students/edit/${student.id}`}>Review</Link>
                </Button>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Recent users"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.recentUsers.length ?? 0) === 0}
        >
          <ul className="divide-y">
            {data?.recentUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Recent students"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.recentStudents.length ?? 0) === 0}
        >
          <ul className="divide-y">
            {data?.recentStudents.map((student) => (
              <li key={student.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.universityRegNo} · {student.batch}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(student.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardPanel
          title="Students per course"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.charts.studentsPerCourse.length ?? 0) === 0}
        >
          <MiniBarChart
            data={data?.charts.studentsPerCourse ?? []}
            xKey="course"
            series={[{ key: "count", label: "Students", color: "#059669" }]}
            height={200}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Recent audit activity"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.recentAudit.length ?? 0) === 0}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/audit">
                <ScrollText className="size-3.5" />
                Audit log
              </Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {data?.recentAudit.map((row) => (
              <li key={row.id} className="py-2 text-sm">
                <p className="font-medium">
                  {row.action} · {row.entity}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel title="Quick links" description="Jump straight to setup pages.">
          <QuickLinks links={QUICK_LINKS} />
          <div className="mt-4 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <Receipt className="mb-1 size-4" />
            Money screens live in the accountant workspace; the admin only manages setup
            and approvals.
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
