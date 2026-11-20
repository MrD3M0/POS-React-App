/**
 * Response types for GET /api/teacher/dashboard.
 *
 * Mirrors the backend module
 * CollegeMS-Backend-Node/src/modules/teacher-dashboard/types.ts — keep both
 * files in sync when the dashboard payload changes.
 */

export type T_DashboardRange = 7 | 30 | 90;

export interface T_DashboardStat {
  /** Number shown in the big figure of the stat card. */
  value: number;
  /** Short helper text under the number. */
  helper: string;
}

export interface T_DashboardStats {
  totalClasses: T_DashboardStat;
  totalStudents: T_DashboardStat;
  pendingAttendance: T_DashboardStat;
  pendingMarksEntry: T_DashboardStat;
  /** Overall attendance % of the selected range (PRESENT + LATE). */
  attendanceRate: number;
  /** Attendance % of the range right before the selected one. */
  previousAttendanceRate: number;
}

export interface T_DashboardAttendancePoint {
  /** BS date (YYYY-MM-DD). */
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

export interface T_DashboardClassAttendance {
  assignmentId: string;
  /** "Subject - Class/Section" */
  label: string;
  subjectName: string;
  classLabel: string;
  presentPercent: number;
  presentCount: number;
  totalRecords: number;
}

export interface T_DashboardResultBucket {
  label: string;
  count: number;
}

export interface T_DashboardResultDistribution {
  /** ExamSubject id (one subject inside an exam). */
  examBatchId: string | null;
  /** "Exam - Subject" */
  label: string;
  buckets: T_DashboardResultBucket[];
  passed: number;
  failed: number;
  total: number;
}

export interface T_DashboardSubjectPassRate {
  subjectName: string;
  passPercent: number;
  passed: number;
  total: number;
}

export interface T_DashboardPassRate {
  examBatchId: string | null;
  label: string;
  subjects: T_DashboardSubjectPassRate[];
  overallPassPercent: number;
}

export type T_DashboardScheduleStatus = "COMPLETED" | "ONGOING" | "UPCOMING";

export interface T_DashboardScheduleItem {
  /** Weekly ClassSchedule row this item came from. */
  scheduleId: string | null;
  sessionId: string | null;
  assignmentId: string;
  periodId: string | null;
  /** "Subject - Class/Section" */
  label: string;
  subjectName: string;
  subjectCode: string | null;
  classLabel: string;
  periodName: string;
  startTime: string | null;
  endTime: string | null;
  /** Room from the weekly routine, null when not set. */
  room: string | null;
  attendanceTaken: boolean;
  status: T_DashboardScheduleStatus;
  /** The first UPCOMING period of the day. */
  isNext: boolean;
}

/** Card payload of GET /dashboard/today-schedule. */
export interface T_DashboardTodaySchedule {
  todaySchedule: T_DashboardScheduleItem[];
  pendingAttendance: number;
  /** Employee-applicable holiday name, null on a working day. */
  holiday: { name: string } | null;
  dateBs: string | null;
  dayOfWeek: string | null;
}

/** One day of GET /dashboard/week-schedule. */
export interface T_DashboardWeekDay {
  date: string;
  dayOfWeek: string;
  holidayName: string | null;
  items: T_DashboardScheduleItem[];
}

export interface T_DashboardWeekSchedule {
  days: T_DashboardWeekDay[];
}

export interface T_DashboardLowAttendanceStudent {
  studentId: string;
  name: string;
  universityRegNo: string;
  classLabel: string;
  subjectName: string;
  attendancePercent: number;
  presentCount: number;
  totalRecords: number;
}

export type T_DashboardMarksStatus = "PENDING" | "PARTIAL" | "COMPLETE";

export interface T_DashboardExamBatch {
  /** ExamSubject id. */
  id: string;
  examId: string;
  examName: string;
  subjectName: string;
  classLabel: string;
  /** "Exam - Subject" */
  label: string;
  examDateBs: string | null;
  fullMarks: number;
  passMarks: number;
  marksStatus: T_DashboardMarksStatus;
  marksEntered: number;
  totalStudents: number;
}

export interface T_DashboardRecentResult {
  resultId: string | null;
  examName: string;
  subjectName: string;
  classLabel: string;
  average: number;
  highest: number;
  lowest: number;
  passPercent: number;
  status: string;
  published: boolean;
}

export interface T_DashboardFilterOption {
  id: string;
  label: string;
}

export interface T_TeacherDashboardResponse {
  stats: T_DashboardStats;
  attendanceTrend: T_DashboardAttendancePoint[];
  classAttendance: T_DashboardClassAttendance[];
  resultDistribution: T_DashboardResultDistribution;
  passRateBySubject: T_DashboardPassRate;
  todaySchedule: T_DashboardScheduleItem[];
  lowAttendanceStudents: T_DashboardLowAttendanceStudent[];
  upcomingExamBatches: T_DashboardExamBatch[];
  recentResults: T_DashboardRecentResult[];
  filters: {
    assignments: T_DashboardFilterOption[];
    examBatches: T_DashboardFilterOption[];
  };
  applied: {
    assignmentId: string | null;
    examBatchId: string | null;
    range: T_DashboardRange;
    todayBs: string | null;
  };
}
