import { Link } from "react-router-dom";
import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Megaphone,
  Receipt,
  RefreshCw,
  UserCircle2,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { useRoleDashboard } from "@/pages/dashboard/hooks/use-role-dashboard";
import {
  DashboardPanel,
  QuickLinks,
  RoleKpi,
} from "@/pages/dashboard/components/dashboard-widgets";
import { formatNpr } from "@/lib/money";

type T_StaffDashboard = {
  todayBs: string | null;
  checkIn: {
    available: boolean;
    status: string;
    checkInTime: string | null;
    distanceKm: number | null;
    leaveType?: string | null;
    note?: string;
  };
  monthAttendance: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
    total: number;
  };
  monthLabel?: string;
  leaveBalances: {
    id: string;
    code: string;
    name: string;
    allowed: number | null;
    used: number;
    remaining: number | null;
  }[];
  leaveRecords: {
    id: string;
    dateBs: string;
    status: string;
    leaveType: string | null;
    remarks: string | null;
  }[];
  latestPayslip: {
    id: string;
    payslipNo: string;
    grossPay: number;
    netPay: number;
    paidDateBs: string | null;
    yearBs: number | null;
    monthBs: number | null;
  } | null;
  notices: {
    id: string;
    title: string;
    publishedAt: string | null;
    isPinned: boolean;
  }[];
  profile: {
    id: string;
    employeeCode: string;
    name: string;
    designation: string;
    department: string | null;
    email: string | null;
    phone: string | null;
    joinDateBs: string;
  } | null;
};

const QUICK_LINKS = [
  { key: "profile", label: "My profile", href: "/staff/profile", icon: UserCircle2 },
  {
    key: "edit-profile",
    label: "Edit profile",
    href: "/staff/profile/edit",
    icon: UserCircle2,
  },
  { key: "payslips", label: "My payslips", href: "/staff/payslips", icon: Receipt },
  {
    key: "attendance",
    label: "My attendance",
    href: "/staff/attendance",
    icon: ClipboardList,
  },
  { key: "leave", label: "Apply for leave", href: "/staff/leave", icon: CalendarDays },
  { key: "notices", label: "Notices", href: "/staff/notices", icon: Megaphone },
];

function statusVariant(status: string) {
  if (status === "PRESENT" || status === "LATE") return "success" as const;
  if (status === "ABSENT") return "destructive" as const;
  if (status === "LEAVE") return "warning" as const;
  return "outline" as const;
}

function formatTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function StaffDashboardPage() {
  const query = useRoleDashboard<T_StaffDashboard>("staff");
  const data = query.data;
  const loading = query.isLoading;
  const error = query.isError;
  const retry = () => void query.refetch();

  const checkIn = data?.checkIn;
  const month = data?.monthAttendance;

  return (
    <div className="p-5">
      <PageHeader
        title="Staff Dashboard"
        description="Your attendance, leave, payslips and notices."
        breadCrumbItems={[
          { title: "Staff", link: "/staff" },
          { title: "Dashboard", link: "/staff" },
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
          title="Today's check-in"
          value={
            <span className="flex items-center gap-2">
              {checkIn?.status === "NOT_MARKED" ? "Not marked" : checkIn?.status ?? "—"}
            </span>
          }
          helper={
            checkIn?.available === false
              ? checkIn.note
              : checkIn?.status === "NOT_MARKED"
                ? "The principal has not recorded your attendance yet."
                : `Recorded at ${formatTime(checkIn?.checkInTime ?? null)}`
          }
          icon={ClipboardCheck}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Present this month"
          value={month?.present ?? 0}
          helper={`${month?.total ?? 0} recorded day(s)`}
          icon={CalendarDays}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Absent"
          value={month?.absent ?? 0}
          helper={`${month?.halfDay ?? 0} half day(s)`}
          icon={ClipboardList}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Leave used"
          value={month?.leave ?? 0}
          helper="This BS month"
          icon={CalendarDays}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
        <RoleKpi
          title="Latest net pay"
          value={data?.latestPayslip ? formatNpr(data.latestPayslip.netPay) : "—"}
          helper={data?.latestPayslip?.payslipNo ?? "No payslip yet"}
          icon={Receipt}
          isLoading={loading}
          isError={error}
          onRetry={retry}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardPanel
          title="Leave balance"
          description="Yearly allowance minus leave recorded this BS year."
          className="lg:col-span-1"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.leaveBalances.length ?? 0) === 0}
          emptyTitle="No leave types configured"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/staff/leave">Apply</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {data?.leaveBalances.map((row) => (
              <li key={row.id} className="py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{row.name}</span>
                  <span className="tabular-nums">
                    {row.remaining == null ? "Unlimited" : `${row.remaining} left`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {row.used} used
                  {row.allowed == null ? "" : ` of ${row.allowed} allowed`}
                </p>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="This month's attendance"
          description={data?.monthLabel ?? "Current BS month"}
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(month?.total ?? 0) === 0}
          emptyTitle="No attendance recorded this month"
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Present", value: month?.present ?? 0, tone: "text-emerald-600" },
              { label: "Absent", value: month?.absent ?? 0, tone: "text-destructive" },
              { label: "Leave", value: month?.leave ?? 0, tone: "text-amber-600" },
              { label: "Half day", value: month?.halfDay ?? 0, tone: "text-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xl font-semibold tabular-nums ${item.tone}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Latest payslip"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={!data?.latestPayslip}
          emptyTitle="No payslip yet"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/staff/payslips">View all</Link>
            </Button>
          }
        >
          {data?.latestPayslip ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{data.latestPayslip.payslipNo}</p>
              <p className="text-xs text-muted-foreground">
                {data.latestPayslip.yearBs ?? "—"}/
                {String(data.latestPayslip.monthBs ?? "").padStart(2, "0")} ·{" "}
                {data.latestPayslip.paidDateBs ?? "not paid yet"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Gross</p>
                  <p className="tabular-nums">{formatNpr(data.latestPayslip.grossPay)}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p className="font-semibold tabular-nums">
                    {formatNpr(data.latestPayslip.netPay)}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/staff/payslips/${data.latestPayslip.id}`}>Open payslip</Link>
              </Button>
            </div>
          ) : null}
        </DashboardPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardPanel
          title="Leave records"
          description="Attendance rows marked as leave."
          className="lg:col-span-2"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.leaveRecords.length ?? 0) === 0}
          emptyTitle="No leave records this month"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Date (BS)</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Leave type</th>
                  <th className="py-2 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data?.leaveRecords.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{row.dateBs}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                    </td>
                    <td className="py-2 pr-3">{row.leaveType ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{row.remarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="My profile"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={!data?.profile}
          emptyTitle="No employee profile linked"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/staff/profile">Open</Link>
            </Button>
          }
        >
          {data?.profile ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{data.profile.name}</p>
              <p className="text-muted-foreground">{data.profile.designation}</p>
              <p className="text-xs text-muted-foreground">
                {data.profile.employeeCode}
                {data.profile.department ? ` · ${data.profile.department}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">{data.profile.email ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{data.profile.phone ?? "—"}</p>
            </div>
          ) : null}
        </DashboardPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardPanel
          title="Staff notices"
          isLoading={loading}
          isError={error}
          onRetry={retry}
          isEmpty={(data?.notices.length ?? 0) === 0}
          emptyTitle="No notices for you"
        >
          <ul className="divide-y">
            {data?.notices.map((notice) => (
              <li key={notice.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <p className="truncate">{notice.title}</p>
                {notice.isPinned ? <Badge variant="outline">Pinned</Badge> : null}
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel title="Quick links">
          <QuickLinks links={QUICK_LINKS} />
        </DashboardPanel>
      </div>
    </div>
  );
}
