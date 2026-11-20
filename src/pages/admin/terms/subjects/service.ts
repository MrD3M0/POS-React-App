import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_TERM_SUBJECT = {
  id: string;
  batchTermId: string;
  subjectId: string;
  creditHour: number | string;
  isElective: boolean;
  /** Elective seats — how many students may pick this elective. Null = unlimited. */
  maxStudents?: number | null;
  createdAt?: string;
  subject?: { id: string; code?: string; name?: string } | null;
  batchTerm?: {
    id: string;
    name?: string;
    termNumber?: number;
    batch?: { id: string; name?: string } | null;
  } | null;
  assignments?: Array<{
    id: string;
    teacher?: {
      employee?: {
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
      } | null;
    } | null;
  }> | null;
};

type T_ListBody<T> = {
  data?: {
    data?: T[];
    pagination?: { page?: number; limit?: number; total?: number };
  };
};

export async function listTermSubjects(batchTermId: string) {
  const res = await axiosInstance.get<T_ListBody<T_TERM_SUBJECT>>(
    UrlConstants.BATCH_TERM_SUBJECT_URL,
    { params: { page: 1, limit: -1, batchTermId } },
  );
  const rows = res.data?.data?.data ?? [];
  return { rows, total: res.data?.data?.pagination?.total ?? rows.length };
}

export async function listSubjectOptions() {
  const res = await axiosInstance.get(UrlConstants.ADMIN_SUBJECT_URL, {
    params: { page: 1, limit: -1, isActive: true },
  });
  return (
    (res.data as { data?: { data?: { id: string; code?: string; name?: string }[] } })
      ?.data?.data ?? []
  );
}

export async function addTermSubject(input: {
  batchTermId: string;
  subjectId: string;
  creditHour: number;
  isElective: boolean;
  maxStudents?: number | null;
}) {
  const res = await axiosInstance.post(
    UrlConstants.BATCH_TERM_SUBJECT_URL,
    input,
  );
  return res.data;
}

/**
 * Bulk assignment — one atomic request (POST /batch-term-subject/bulk).
 * Backend validates every row first (unknown subject, duplicate, already
 * assigned) and rolls back everything on any failure.
 */
export async function bulkAddTermSubjects(input: {
  batchTermId: string;
  subjects: Array<{ subjectId: string; creditHour: number; isElective: boolean; maxStudents?: number | null }>;
}) {
  const res = await axiosInstance.post(
    `${UrlConstants.BATCH_TERM_SUBJECT_URL}/bulk`,
    input,
  );
  return res.data;
}

/** Update an already-assigned row (credit hour, elective flag, elective seats). */
export async function updateTermSubject(
  id: string,
  input: { creditHour?: number; isElective?: boolean; maxStudents?: number | null },
) {
  const res = await axiosInstance.patch(
    `${UrlConstants.BATCH_TERM_SUBJECT_URL}/${id}`,
    input,
  );
  return res.data;
}

export async function removeTermSubject(id: string) {
  const res = await axiosInstance.delete(
    `${UrlConstants.BATCH_TERM_SUBJECT_URL}/${id}`,
  );
  return res.data;
}

export type T_TERM_DETAIL = {
  id: string;
  name?: string;
  termNumber?: number;
  batch?: {
    id: string;
    name?: string;
    /** Which term number the batch is currently running (current semester). */
    currentTermNumber?: number | null;
    course?: { id: string; code?: string; name?: string; system?: "SEMESTER" | "YEARLY" } | null;
  } | null;
};

export async function getTerm(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.BATCH_TERM_URL}/${id}`);
  return (res.data as { data?: T_TERM_DETAIL })?.data;
}
