import { useEffect } from "react";
import {
  BookText,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
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
    lowAttendanceQuery.isFetching;

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
