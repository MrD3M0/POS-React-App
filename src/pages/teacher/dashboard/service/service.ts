import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type {
  T_DashboardAttendancePoint,
  T_DashboardClassAttendance,
  T_DashboardExamBatch,
  T_DashboardFilterOption,
  T_DashboardLowAttendanceStudent,
  T_DashboardPassRate,
  T_DashboardRange,
  T_DashboardRecentResult,
  T_DashboardResultDistribution,
  T_DashboardScheduleItem,
  T_DashboardStats,
  T_TeacherDashboardResponse,
} from "@/types/teacher-dashboard";

export type T_DashboardFilters = {
  /** Teaching assignment id (class) — "" means "all classes". */
  assignmentId: string;
  /** Exam batch (exam subject) id — "" means the default one. */
  examBatchId: string;
  /** Attendance trend window in days. */
  range: T_DashboardRange;
};

export async function getTeacherDashboard(
  filters: T_DashboardFilters,
): Promise<T_TeacherDashboardResponse> {
  const res = await axiosInstance.get(UrlConstants.TEACHER_DASHBOARD_URL, {
    params: {
      assignmentId: filters.assignmentId || undefined,
      examBatchId: filters.examBatchId || undefined,
      range: filters.range,
    },
  });
  return res.data?.data as T_TeacherDashboardResponse;
}

// ── One call per dashboard card ───────────────────────────────────────────
// Every card asks for its own data, so a card that fails (or is slow) never
// blocks the other cards.

const cardParams = (filters: T_DashboardFilters) => ({
  assignmentId: filters.assignmentId || undefined,
  examBatchId: filters.examBatchId || undefined,
  range: filters.range,
});

async function getCard<T>(
  path: string,
  filters: T_DashboardFilters,
): Promise<T> {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_DASHBOARD_URL}/${path}`, {
    params: cardParams(filters),
  });
  return res.data?.data as T;
}

export function getDashboardStats(filters: T_DashboardFilters) {
  return getCard<T_DashboardStats>("stats", filters);
}

export function getDashboardAttendanceTrend(filters: T_DashboardFilters) {
  return getCard<T_DashboardAttendancePoint[]>("attendance-trend", filters);
}

export function getDashboardClassAttendance(filters: T_DashboardFilters) {
  return getCard<T_DashboardClassAttendance[]>("class-attendance", filters);
}

export function getDashboardTodaySchedule(filters: T_DashboardFilters) {
  return getCard<T_DashboardScheduleItem[]>("today-schedule", filters);
}

export function getDashboardExamBatches(filters: T_DashboardFilters) {
  return getCard<{
    upcomingExamBatches: T_DashboardExamBatch[];
    pendingMarksEntry: number;
  }>("exam-batches", filters);
}

export function getDashboardResultDistribution(filters: T_DashboardFilters) {
  return getCard<T_DashboardResultDistribution>("result-distribution", filters);
}

export function getDashboardPassRate(filters: T_DashboardFilters) {
  return getCard<T_DashboardPassRate>("pass-rate", filters);
}

export function getDashboardRecentResults(filters: T_DashboardFilters) {
  return getCard<T_DashboardRecentResult[]>("recent-results", filters);
}

export function getDashboardLowAttendance(filters: T_DashboardFilters) {
  return getCard<T_DashboardLowAttendanceStudent[]>("low-attendance", filters);
}

export function getDashboardFilters(filters: T_DashboardFilters) {
  return getCard<{
    assignments: T_DashboardFilterOption[];
    examBatches: T_DashboardFilterOption[];
  }>("filters", filters);
}
