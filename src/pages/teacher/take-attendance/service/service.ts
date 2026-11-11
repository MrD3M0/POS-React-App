import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

// ── Types ─────────────────────────────────────────────────────────────────────
// Mirrors the backend modules exactly: attendance-session, student-attendance,
// teaching-assignment, period, batch-term(-subject) and student.

export type T_ATTENDANCE_STATUS = "PRESENT" | "ABSENT" | "LEAVE" | "LATE";

export type T_TEACHER_ASSIGNMENT = {
  id: string;
  teacherId?: string;
  batchTermSubjectId?: string;
  isActive?: boolean;
  batchTermSubject?: {
    id?: string;
    subject?: { code?: string; name?: string } | null;
    batchTerm?: { name?: string; batch?: { name?: string } | null } | null;
  } | null;
};

export type T_PERIOD = {
  id: string;
  name?: string;
  periodNumber?: number;
  startTime?: string;
  endTime?: string;
};

export type T_ATTENDANCE_RECORD = {
  id?: string;
  studentId?: string;
  status?: T_ATTENDANCE_STATUS;
  remarks?: string | null;
};

export type T_ATTENDANCE_SESSION = {
  id: string;
  teachingAssignmentId?: string;
  teacherId?: string;
  periodId?: string;
  dateBs?: string;
  isLocked?: boolean;
  period?: { id?: string; name?: string; periodNumber?: number } | null;
};

export type T_ROSTER_STUDENT = {
  id: string;
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  photoUrl?: string | null;
};

export type T_ROSTER_ENTRY = {
  student: T_ROSTER_STUDENT;
  record: T_ATTENDANCE_RECORD | null;
};

export type T_HOLIDAY = {
  id: string;
  dateBs: string;
  name: string;
  appliesToStudents: boolean;
};

export type T_ATTENDANCE_RECORD_INPUT = {
  studentId: string;
  status: T_ATTENDANCE_STATUS;
  remarks?: string | null;
};

export type T_ATTENDANCE_SHEET_DATA = {
  session: T_ATTENDANCE_SESSION | null;
  rows: T_ROSTER_ENTRY[];
};

type T_RAW_STUDENT = {
  id: string;
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  photoUrl?: string | null;
  batchId?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
// Every list endpoint normalizes to `data: T[]` or `data: { data: T[] }`.
export function toRows<T>(payload: unknown): T[] {
  const envelope = payload as { data?: T[] | { data?: T[] } } | undefined;
  const inner = envelope?.data;
  if (Array.isArray(inner)) return inner;
  if (inner && Array.isArray(inner.data)) return inner.data;
  return [];
}

function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("response" in error))
    return false;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status === 404;
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * GET /teaching-assignment
 * NOTE (backend gap): the endpoint has no actor scoping, so a TEACHER receives
 * every assignment. The screen filters to `isActive` only; see final report.
 */
export async function listTeachingAssignments(): Promise<
  T_TEACHER_ASSIGNMENT[]
> {
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHER_MY_CLASSES_URL}`,
    {
      params: { page: 1, limit: 999 },
    },
  );
  return toRows<T_TEACHER_ASSIGNMENT>(res.data);
}

export async function listActivePeriods(): Promise<T_PERIOD[]> {
  const res = await axiosInstance.get(`${UrlConstants.PERIOD_URL}`, {
    params: { page: 1, limit: 999, isActive: true },
  });
  return toRows<T_PERIOD>(res.data);
}

/**
 * GET /attendance-session?search=<dateBs>
 * The API can only search on `dateBs`; the exact assignment + period match is
 * resolved client-side.
 */
export async function findAttendanceSession(input: {
  assignmentId: string;
  periodId: string;
  dateBs: string;
}): Promise<T_ATTENDANCE_SESSION | null> {
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}`,
    {
      params: { page: 1, limit: 999, search: input.dateBs },
    },
  );
  const sessions = toRows<T_ATTENDANCE_SESSION>(res.data);
  return (
    sessions.find(
      (session) =>
        session.dateBs === input.dateBs &&
        session.periodId === input.periodId &&
        session.teachingAssignmentId === input.assignmentId,
    ) ?? null
  );
}

/** GET /attendance-session/:id/roster */
export async function getAttendanceSessionRoster(
  sessionId: string,
): Promise<T_ROSTER_ENTRY[]> {
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}/${sessionId}/roster`,
  );
  return toRows<T_ROSTER_ENTRY>(res.data);
}

/**
 * Resolves the batch of an assignment through the existing lookup modules,
 * because the assignment payload does not carry `batchId` and /student ignores
 * the `batchId` filter.
 */
export async function getAssignmentBatchId(
  assignment: T_TEACHER_ASSIGNMENT,
): Promise<string> {
  if (!assignment.batchTermSubjectId) {
    throw new Error("Teaching assignment is missing its batch term subject");
  }
  const subjectRes = await axiosInstance.get(
    `${UrlConstants.BATCH_TERM_SUBJECT_URL}/${assignment.batchTermSubjectId}`,
  );
  const batchTermId = (subjectRes.data as { data?: { batchTermId?: string } })
    .data?.batchTermId;
  if (!batchTermId)
    throw new Error("Batch term could not be resolved for this assignment");

  const termRes = await axiosInstance.get(
    `${UrlConstants.BATCH_TERM_URL}/${batchTermId}`,
  );
  const batchId = (termRes.data as { data?: { batchId?: string } }).data
    ?.batchId;
  if (!batchId)
    throw new Error("Batch could not be resolved for this assignment");
  return batchId;
}

/**
 * GET /student?status=ACTIVE&approvalStatus=APPROVED
 * NOTE (backend gap): `batchId` is not a supported filter, so the batch scope is
 * applied client-side after the page is fetched.
 */
export async function listApprovedBatchStudents(
  batchId: string,
): Promise<T_ROSTER_STUDENT[]> {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_STUDENTS_URL}`, {
    params: {
      page: 1,
      limit: 999,
      status: "ACTIVE",
      approvalStatus: "APPROVED",
    },
  });
  return toRows<T_RAW_STUDENT>(res.data)
    .filter((student) => student.batchId === batchId)
    .map((student) => ({
      id: student.id,
      universityRegNo: student.universityRegNo,
      firstName: student.firstName,
      middleName: student.middleName ?? null,
      lastName: student.lastName,
      photoUrl: student.photoUrl ?? null,
    }));
}

/**
 * Loads the sheet for one class session: the saved session + roster when it
 * already exists, otherwise the approved/active students of the batch.
 */
export async function loadAttendanceSheet(input: {
  assignment: T_TEACHER_ASSIGNMENT;
  periodId: string;
  dateBs: string;
}): Promise<T_ATTENDANCE_SHEET_DATA> {
  const session = await findAttendanceSession({
    assignmentId: input.assignment.id,
    periodId: input.periodId,
    dateBs: input.dateBs,
  });
  if (session) {
    return { session, rows: await getAttendanceSessionRoster(session.id) };
  }
  const batchId = await getAssignmentBatchId(input.assignment);
  const students = await listApprovedBatchStudents(batchId);
  return {
    session: null,
    rows: students.map((student) => ({ student, record: null })),
  };
}

/**
 * GET /holiday?search=<dateBs>
 * NOTE (backend gap): the Holiday model exists but there is no `/holiday` route
 * yet. A 404 is treated as "no holiday" so the screen keeps working.
 */
export async function getStudentHoliday(
  dateBs: string,
): Promise<T_HOLIDAY | null> {
  try {
    const res = await axiosInstance.get(`${UrlConstants.HOLIDAY_URL}`, {
      params: { page: 1, limit: 10, search: dateBs },
    });
    return (
      toRows<T_HOLIDAY>(res.data).find(
        (holiday) => holiday.dateBs === dateBs && holiday.appliesToStudents,
      ) ?? null
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

export type T_CREATE_SESSION_INPUT = {
  teachingAssignmentId: string;
  teacherId: string;
  periodId: string;
  dateBs: string;
};

/** POST /attendance-session (idempotent on assignment + period + date). */
export async function createAttendanceSession(
  input: T_CREATE_SESSION_INPUT,
): Promise<T_ATTENDANCE_SESSION> {
  const res = await axiosInstance.post(
    `${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}`,
    input,
  );
  const payload = res.data as { data?: T_ATTENDANCE_SESSION };
  if (!payload.data?.id)
    throw new Error("Attendance session could not be created");
  return payload.data;
}

/** POST /student-attendance/bulk — one request for the whole class. */
export async function bulkMarkAttendance(input: {
  sessionId: string;
  records: T_ATTENDANCE_RECORD_INPUT[];
}): Promise<void> {
  await axiosInstance.post(
    `${UrlConstants.STUDENT_ATTENDANCE_URL}/bulk`,
    input,
  );
}

/**
 * Single user action: creates the session once (when absent) then bulk-marks the
 * whole roster. NOTE (backend gap): there is no endpoint that performs both in a
 * single transaction — see final report.
 */
export async function saveAttendanceSheet(input: {
  sessionId: string | null;
  assignmentId: string;
  teacherId: string;
  periodId: string;
  dateBs: string;
  records: T_ATTENDANCE_RECORD_INPUT[];
}): Promise<string> {
  let sessionId = input.sessionId;
  if (!sessionId) {
    const session = await createAttendanceSession({
      teachingAssignmentId: input.assignmentId,
      teacherId: input.teacherId,
      periodId: input.periodId,
      dateBs: input.dateBs,
    });
    sessionId = session.id;
  }
  await bulkMarkAttendance({ sessionId, records: input.records });
  return sessionId;
}
