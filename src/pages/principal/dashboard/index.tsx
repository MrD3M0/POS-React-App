import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  FileCheck,
  GraduationCap,
  Megaphone,
  RefreshCw,
  Wallet,
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
import { formatNpr } from "@/lib/money";

type T_Group = {
  id: string;
  batchName: string;
  termName: string;
  subjectName: string;
  examName: string;
  teacherName: string | null;
  status: string;
  passPercent: number;
  studentsCount: number;
  rejectionReason: string | null;
};

type T_PrincipalDashboard = {
  todayBs: string | null;
  needsApproval: { count: number; groups: T_Group[] };
  payrolls: {
    count: number;
    items: {
      id: string;
      label: string;
      status: string;
      payslips: number;
      gross: number;
    }[];
  };
  noticeDrafts: {
    count: number;
    items: { id: string; title: string; createdAt: string | null }[];
  };
  employeeAttendanceToday: {
    total: number;
    present: number;
    absent: number;
    leave: number;
    notCheckedIn: number;
  };
  studentAttendanceByBatch: {
    batchId: string;
    batch: string;
    course: string;
    percent7: number;
    percent30: number;
    present7: number;
    total7: number;
    present30: number;
    total30: number;
  }[];
  latestPublishedExam: {
    examName: string;
    batch: string;
    term: string;
    total: number;
    passed: number;
    passPercent: number;
    publishedAt: string | null;
  } | null;
  latestPublishedResults: {
    id: string;
    examName: string;
    batch: string;
    term: string;
    student: string;
    percentage: number;
    gpa: number;
    isPassed: boolean;
    publishedAt: string | null;
  }[];
  latestNotices: {
    id: string;
    title: string;
    publishedAt: string | null;
    isPinned: boolean;
  }[];
};

const QUICK_LINKS = [
  {
    key: "pending-results",
    label: "Pending results",
    href: "/principal/results/pending",
    icon: FileCheck,
  },
  {
    key: "publish-results",
    label: "Publish results",
    href: "/principal/results/publish",
    icon: GraduationCap,
  },
  {
    key: "payroll",
    label: "Payroll approval",
    href: "/principal/payroll/pending",
    icon: Wallet,
  },
  {
    key: "attendance",
    label: "Employee attendance",
    href: "/principal/attendance",
    icon: ClipboardList,
  },
  { key: "reports", label: "Reports", href: "/principal/reports", icon: BarChart3 },
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

export default function PrincipalDashboardPage() {
  const query = useRoleDashboard<T_PrincipalDashboard>("principal");
  const data = query.data;
  const loading = query.isLoading;
  const error = query.isError;
  const retry = () => void query.refetch();

  return (
    <div className="p-5">
      <PageHeader
        title="Principal Dashboard"
        description="Results, payroll and attendance decisions that need you."
        breadCrumbItems={[
          { title: "Principal", link: "/principal" },
          { title: "Dashboard", link: "/principal" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={retry} loading={query.isFetching}>
            {!query.isFetching ? <RefreshCw className="size-3.5" /> : null}
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <RoleKpi
          title="Subjects to approve"
          value={data?.needsApproval.count ?? 0}
          helper="Submitted marks by Batch + Term + Subject"
          icon={FileCheck}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Pending payrolls"
          value={data?.payrolls.count ?? 0}
          icon={Wallet}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Notice drafts"
          value={data?.noticeDrafts.count ?? 0}
          icon={Megaphone}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Present today"
          value={data?.employeeAttendanceToday.present ?? 0}
          helper={`${data?.employeeAttendanceToday.absent ?? 0} absent · ${data?.employeeAttendanceToday.leave ?? 0} leave`}
          icon={CalendarCheck}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Not checked in"
          value={data?.employeeAttendanceToday.notCheckedIn ?? 0}
          helper={`of ${data?.employeeAttendanceToday.total ?? 0} employees`}
          icon={ClipboardList}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardPanel
          title="Results waiting for approval"
          description="One row per Batch → Term → Subject."
          className="lg:col-span-2"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.needsApproval.groups.length ?? 0) === 0}
          emptyTitle="No results waiting"
          emptyDescription="Teachers have not submitted marks that need review."
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/principal/results/pending">Review all</Link>
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Batch</th>
                  <th className="py-2 pr-3 font-medium">Term</th>
                  <th className="py-2 pr-3 font-medium">Subject</th>
                  <th className="py-2 pr-3 font-medium">Teacher</th>
                  <th className="py-2 text-right font-medium">Pass %</th>
                </tr>
              </thead>
              <tbody>
                {data?.needsApproval.groups.slice(0, 6).map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{row.batchName}</td>
                    <td className="py-2 pr-3">{row.termName}</td>
                    <td className="py-2 pr-3">{row.subjectName}</td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {row.teacherName ?? "—"}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {row.passPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Needs your action"
          isLoading={loading}
          isError={error}
          onRetry={retry}
        >
          <ActionList
            items={[
              {
                key: "results",
                label: "Result subjects waiting for review",
                href: "/principal/results/pending",
                count: data?.needsApproval.count ?? 0,
                severity: "warning",
              },
              {
                key: "payroll",
                label: "Payrolls waiting for approval",
                href: "/principal/payroll/pending",
                count: data?.payrolls.count ?? 0,
                severity: "warning",
              },
              {
                key: "notices",
                label: "Notice drafts to publish",
                href: "/principal/notices",
                count: data?.noticeDrafts.count ?? 0,
                severity: "info",
              },
              {
                key: "attendance",
                label: "Employees not checked in today",
                href: "/principal/attendance",
                count: data?.employeeAttendanceToday.notCheckedIn ?? 0,
                severity: "info",
              },
            ]}
          />
        </DashboardPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardPanel
          title="Student attendance by batch"
          description="Presence over the last 7 and 30 days."
          className="lg:col-span-2"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.studentAttendanceByBatch.length ?? 0) === 0}
          emptyTitle="No attendance yet"
        >
          <MiniBarChart
            data={(data?.studentAttendanceByBatch ?? []).map((row) => ({
              batch: row.batch,
              last7: row.percent7,
              last30: row.percent30,
            }))}
            xKey="batch"
            series={[
              { key: "last7", label: "Last 7 days", color: "#2563eb" },
              { key: "last30", label: "Last 30 days", color: "#93c5fd" },
            ]}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Latest published exam"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={!data?.latestPublishedExam}
          emptyTitle="No results published yet"
        >
          {data?.latestPublishedExam ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{data.latestPublishedExam.examName}</p>
              <p className="text-xs text-muted-foreground">
                {data.latestPublishedExam.batch} · {data.latestPublishedExam.term} ·{" "}
                {formatDate(data.latestPublishedExam.publishedAt)}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold">
                  {data.latestPublishedExam.passPercent.toFixed(1)}%
                </span>
                <span className="pb-1 text-xs text-muted-foreground">
                  pass rate
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.latestPublishedExam.passed} of {data.latestPublishedExam.total}{" "}
                students passed
              </p>
            </div>
          ) : null}
        </DashboardPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardPanel
          title="Latest published results"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.latestPublishedResults.length ?? 0) === 0}
        >
          <ul className="divide-y">
            {data?.latestPublishedResults.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.student}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.examName} · {row.batch} · {row.term}
                  </p>
                </div>
                <Badge variant={row.isPassed ? "success" : "destructive"}>
                  {row.percentage.toFixed(1)}%
                </Badge>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Payrolls waiting"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.payrolls.items.length ?? 0) === 0}
          emptyTitle="No payroll waiting"
        >
          <ul className="divide-y">
            {data?.payrolls.items.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.payslips} payslip(s)
                  </p>
                </div>
                <span className="text-xs tabular-nums">{formatNpr(row.gross)}</span>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Latest notices"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.latestNotices.length ?? 0) === 0}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/principal/notices">All notices</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {data?.latestNotices.map((notice) => (
              <li key={notice.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <p className="truncate">{notice.title}</p>
                {notice.isPinned ? <Badge variant="outline">Pinned</Badge> : null}
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>

      <div className="mt-4">
        <DashboardPanel title="Quick links">
          <QuickLinks links={QUICK_LINKS} />
        </DashboardPanel>
      </div>
    </div>
  );
}
