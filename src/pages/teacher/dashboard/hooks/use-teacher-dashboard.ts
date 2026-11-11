import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_DashboardRange } from "@/types/teacher-dashboard";
import {
  getDashboardAttendanceTrend,
  getDashboardClassAttendance,
  getDashboardExamBatches,
  getDashboardFilters,
  getDashboardLowAttendance,
  getDashboardPassRate,
  getDashboardRecentResults,
  getDashboardResultDistribution,
  getDashboardStats,
  getDashboardTodaySchedule,
  type T_DashboardFilters,
} from "../service/service";

/**
 * One hook per dashboard card.
 *
 * Every card has its own query (and therefore its own loading and error
 * state), so a card that fails only shows an error inside that card — the
 * other cards keep working.
 */
export function useTeacherDashboard() {
  const [filters, setFilters] = useState<T_DashboardFilters>({
    assignmentId: "",
    examBatchId: "",
    range: 30,
  });

  const filterKey = [
    filters.assignmentId,
    filters.examBatchId,
    filters.range,
  ];

  const filtersQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "filters", ...filterKey],
    queryFn: () => getDashboardFilters(filters),
    staleTime: 5 * 60_000,
  });

  const statsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "stats", ...filterKey],
    queryFn: () => getDashboardStats(filters),
    staleTime: 60_000,
  });

  const trendQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "attendance-trend", ...filterKey],
    queryFn: () => getDashboardAttendanceTrend(filters),
    staleTime: 60_000,
  });

  const classAttendanceQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "class-attendance", ...filterKey],
    queryFn: () => getDashboardClassAttendance(filters),
    staleTime: 60_000,
  });

  const scheduleQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "today-schedule", ...filterKey],
    queryFn: () => getDashboardTodaySchedule(filters),
    staleTime: 60_000,
  });

  const examBatchesQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "exam-batches", ...filterKey],
    queryFn: () => getDashboardExamBatches(filters),
    staleTime: 60_000,
  });

  const resultDistributionQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "result-distribution", ...filterKey],
    queryFn: () => getDashboardResultDistribution(filters),
    staleTime: 60_000,
  });

  const passRateQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "pass-rate", ...filterKey],
    queryFn: () => getDashboardPassRate(filters),
    staleTime: 60_000,
  });

  const recentResultsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "recent-results", ...filterKey],
    queryFn: () => getDashboardRecentResults(filters),
    staleTime: 60_000,
  });

  const lowAttendanceQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_DASHBOARD, "low-attendance", ...filterKey],
    queryFn: () => getDashboardLowAttendance(filters),
    staleTime: 60_000,
  });

  const setAssignmentId = (assignmentId: string) =>
    setFilters((previous) => ({ ...previous, assignmentId }));

  const setExamBatchId = (examBatchId: string) =>
    setFilters((previous) => ({ ...previous, examBatchId }));

  const setRange = (range: T_DashboardRange) =>
    setFilters((previous) => ({ ...previous, range }));

  const resetFilters = () =>
    setFilters({ assignmentId: "", examBatchId: "", range: 30 });

  const hasActiveFilters = useMemo(
    () => Boolean(filters.assignmentId || filters.examBatchId),
    [filters.assignmentId, filters.examBatchId],
  );

  return {
    filters,
    setAssignmentId,
    setExamBatchId,
    setRange,
    resetFilters,
    hasActiveFilters,

    // Filter options (class / exam batch selectors).
    assignmentOptions: filtersQuery.data?.assignments ?? [],
    examBatchOptions: filtersQuery.data?.examBatches ?? [],

    // One entry per card, each with its own loading / error state.
    stats: statsQuery,
    attendanceTrend: trendQuery,
    classAttendance: classAttendanceQuery,
    todaySchedule: scheduleQuery,
    examBatches: examBatchesQuery,
    resultDistribution: resultDistributionQuery,
    passRate: passRateQuery,
    recentResults: recentResultsQuery,
    lowAttendance: lowAttendanceQuery,
  };
}
