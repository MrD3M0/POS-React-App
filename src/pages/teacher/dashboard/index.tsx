import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookText,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  ListChecks,
  RefreshCw,
  Send,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import { useRoleDashboard } from "@/pages/dashboard/hooks/use-role-dashboard";
import { RoleKpi } from "@/pages/dashboard/components/dashboard-widgets";
import { formatNpr } from "@/lib/money";
import { useTeacherDashboard } from "./hooks/use-teacher-dashboard";
import StatCard from "./components/stat-card";
import AttendanceTrendChart from "./components/attendance-trend-chart";
import ClassAttendanceChart from "./components/class-attendance-chart";
import ResultDistributionChart from "./components/result-distribution-chart";
import PassRateChart from "./components/pass-rate-chart";
import TodaySchedule from "./components/today-schedule";
import LowAttendanceTable from "./components/low-attendance-table";
import UpcomingExamsTable from "./components/upcoming-exams-table";
import RecentResultsTable from "./components/recent-results-table";
import { formatTrend } from "./dashboard-utils";

/**
 * Aggregate payload from `GET /dashboard/teacher`: one call for the cards that
 * are not part of the per-widget teacher dashboard endpoints.
 */
type T_TeacherPulse = {
  checkIn?: {
    available?: boolean;
    status?: string;
    checkInTime?: string | null;
    note?: string;
  };
  todayClasses?: unknown[];
  marksNeedingEntry?: unknown[];
  rejectedSubjects?: Array<{
    id: string;
    subjectName: string;
    batchName: string;
    termName: string;
    rejectionReason: string | null;
  }>;
  submissionStatus?: {
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  addedStudentsPending?: Array<{ id: string; name: string }>;
  batchPay?: { expectedMonthly: number; items: unknown[] };
};

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Every card loads on its own (its own API call), so a card that fails shows
 * an error inside that card only — the rest of the dashboard keeps working.
 */
export default function TeacherDashboardPage() {
  const {
    filters,
    assignmentOptions,
    examBatchOptions,
    setAssignmentId,
    setExamBatchId,
    setRange,
    resetFilters,
    hasActiveFilters,
    stats: statsQuery,
    attendanceTrend: trendQuery,
    classAttendance: classAttendanceQuery,
    todaySchedule: scheduleQuery,
    examBatches: examBatchesQuery,
    resultDistribution: distributionQuery,
    passRate: passRateQuery,
    recentResults: recentResultsQuery,
    lowAttendance: lowAttendanceQuery,
  } = useTeacherDashboard();

  const stats = statsQuery.data;
  const pulseQuery = useRoleDashboard<T_TeacherPulse>("teacher");
  const pulse = pulseQuery.data;

  // Keep the exam-batch selector in sync with the value the server applied.
  useEffect(() => {
    const applied = distributionQuery.data?.examBatchId;
    if (applied && applied !== filters.examBatchId) {
      setExamBatchId(applied);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributionQuery.data?.examBatchId]);

  const isRefreshing =
    statsQuery.isFetching ||
    trendQuery.isFetching ||
    classAttendanceQuery.isFetching ||
    scheduleQuery.isFetching ||
    examBatchesQuery.isFetching ||
    distributionQuery.isFetching ||
    passRateQuery.isFetching ||
    recentResultsQuery.isFetching ||
    lowAttendanceQuery.isFetching ||
    pulseQuery.isFetching;

  const refreshAll = () => {
    void statsQuery.refetch();
    void trendQuery.refetch();
    void classAttendanceQuery.refetch();
    void scheduleQuery.refetch();
    void examBatchesQuery.refetch();
    void distributionQuery.refetch();
    void passRateQuery.refetch();
    void recentResultsQuery.refetch();
    void lowAttendanceQuery.refetch();
    void pulseQuery.refetch();
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Teacher Dashboard"
        description="Classes, attendance, marks entry and results at a glance."
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher/dashboard" },
          { title: "Dashboard", link: "/teacher/dashboard" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              loading={isRefreshing}
            >
              {!isRefreshing ? <RefreshCw className="size-3.5" /> : null}
              Refresh
            </Button>
          </div>
        }
      />

      {/* Pulse — one aggregate request for the action cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <RoleKpi
          title="Today's check-in"
          value={
            pulse?.checkIn?.status === "NOT_MARKED" || !pulse?.checkIn?.status
              ? "Not marked"
              : pulse.checkIn.status
          }
          helper={
            pulse?.checkIn?.available === false
              ? pulse.checkIn.note
              : pulse?.checkIn?.checkInTime
                ? `Recorded at ${formatTime(pulse.checkIn.checkInTime)}`
                : "Attendance is recorded by the principal."
          }
          icon={ClipboardCheck}
          isLoading={pulseQuery.isLoading}
          isError={pulseQuery.isError}
          onRetry={() => void pulseQuery.refetch()}
        />
        <RoleKpi
          title="Marks to enter"
          value={pulse?.marksNeedingEntry?.length ?? 0}
          helper="Exams with incomplete marks"
          icon={ListChecks}
          isLoading={pulseQuery.isLoading}
          isError={pulseQuery.isError}
          onRetry={() => void pulseQuery.refetch()}
        />
        <RoleKpi
          title="Rejected subjects"
          value={pulse?.submissionStatus?.rejected ?? 0}
          helper="Fix the reason and re-submit"
          icon={Send}
          isLoading={pulseQuery.isLoading}
          isError={pulseQuery.isError}
          onRetry={() => void pulseQuery.refetch()}
        />
        <RoleKpi
          title="Students added"
          value={pulse?.addedStudentsPending?.length ?? 0}
          helper="Waiting for admin approval"
          icon={GraduationCap}
          isLoading={pulseQuery.isLoading}
          isError={pulseQuery.isError}
          onRetry={() => void pulseQuery.refetch()}
        />
        <RoleKpi
          title="Expected batch pay"
          value={
            pulse?.batchPay ? formatNpr(pulse.batchPay.expectedMonthly) : "—"
          }
          helper="This BS month"
          icon={Wallet}
          isLoading={pulseQuery.isLoading}
          isError={pulseQuery.isError}
          onRetry={() => void pulseQuery.refetch()}
        />
      </div>

      {pulse && (pulse.rejectedSubjects?.length ?? 0) > 0 ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-destructive">
              {pulse.rejectedSubjects?.length} subject(s) were rejected by the
              principal
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/teacher/marks/submit">Open Marks Submission</Link>
            </Button>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-destructive">
            {pulse.rejectedSubjects?.slice(0, 3).map((subject) => (
              <li key={subject.id}>
                {subject.subjectName} · {subject.batchName} ·{" "}
                {subject.termName}
                {subject.rejectionReason
                  ? ` — ${subject.rejectionReason}`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Row 1 — stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses.value ?? 0}
          helper={stats?.totalClasses.helper ?? "your teaching assignments"}
          icon={BookText}
          isLoading={statsQuery.isLoading}
          isError={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents.value ?? 0}
          helper={stats?.totalStudents.helper ?? "across your batches"}
          icon={GraduationCap}
          isLoading={statsQuery.isLoading}
          isError={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
        />
        <StatCard
          title="Pending Attendance"
          value={stats?.pendingAttendance.value ?? 0}
          helper={stats?.pendingAttendance.helper ?? "sessions left today"}
          icon={ClipboardList}
          isLoading={statsQuery.isLoading}
          isError={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
        />
        <StatCard
          title="Pending Marks Entry"
          value={stats?.pendingMarksEntry.value ?? 0}
          helper={stats?.pendingMarksEntry.helper ?? "exams need marks"}
          icon={ListChecks}
          isLoading={statsQuery.isLoading}
          isError={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
        />
      </div>

      {/* Row 2 — charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AttendanceTrendChart
          data={trendQuery.data ?? []}
          assignments={assignmentOptions}
          assignmentId={filters.assignmentId}
          range={filters.range}
          isLoading={trendQuery.isLoading}
          isError={trendQuery.isError}
          onRetry={() => void trendQuery.refetch()}
          onAssignmentChange={setAssignmentId}
          onRangeChange={setRange}
        />
        <ClassAttendanceChart
          data={classAttendanceQuery.data ?? []}
          isLoading={classAttendanceQuery.isLoading}
          isError={classAttendanceQuery.isError}
          onRetry={() => void classAttendanceQuery.refetch()}
        />
        <ResultDistributionChart
          distribution={
            distributionQuery.data ?? {
              examBatchId: null,
              label: "",
              buckets: [],
              passed: 0,
              failed: 0,
              total: 0,
            }
          }
          examBatches={examBatchOptions}
          examBatchId={filters.examBatchId}
          isLoading={distributionQuery.isLoading}
          isError={distributionQuery.isError}
          onRetry={() => void distributionQuery.refetch()}
          onExamBatchChange={setExamBatchId}
        />
        <PassRateChart
          data={
            passRateQuery.data ?? {
              examBatchId: null,
              label: "",
              subjects: [],
              overallPassPercent: 0,
            }
          }
          isLoading={passRateQuery.isLoading}
          isError={passRateQuery.isError}
          onRetry={() => void passRateQuery.refetch()}
        />
      </div>

      {/* Row 3 — schedule + tables */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TodaySchedule
          data={scheduleQuery.data ?? []}
          isLoading={scheduleQuery.isLoading}
          isError={scheduleQuery.isError}
          onRetry={() => void scheduleQuery.refetch()}
        />
        <LowAttendanceTable
          data={lowAttendanceQuery.data ?? []}
          isLoading={lowAttendanceQuery.isLoading}
          isError={lowAttendanceQuery.isError}
          onRetry={() => void lowAttendanceQuery.refetch()}
        />
        <UpcomingExamsTable
          data={examBatchesQuery.data?.upcomingExamBatches ?? []}
          isLoading={examBatchesQuery.isLoading}
          isError={examBatchesQuery.isError}
          onRetry={() => void examBatchesQuery.refetch()}
        />
        <RecentResultsTable
          data={recentResultsQuery.data ?? []}
          isLoading={recentResultsQuery.isLoading}
          isError={recentResultsQuery.isError}
          onRetry={() => void recentResultsQuery.refetch()}
        />
      </div>

      {stats ? (
        <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Attendance over the last {filters.range} days:{" "}
          {stats.attendanceRate.toFixed(1)}% (
          {formatTrend(stats.attendanceRate, stats.previousAttendanceRate)} vs
          the previous period).
        </p>
      ) : statsQuery.isError ? (
        <AlertHandler
          variant="error"
          title="Could not load the summary"
          message={
            (statsQuery.error as { message?: string } | undefined)?.message ??
            "Please try again."
          }
        />
      ) : null}
    </div>
  );
}
