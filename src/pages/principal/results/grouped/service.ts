import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

/** Approval state of one Batch + Term + Subject (stored on ExamSubject). */
export type TResultGroupStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export type TResultGroup = {
  id: string;
  examId: string;
  examName: string;
  examTypeName: string | null;
  batchId: string;
  batchName: string;
  termId: string;
  termName: string;
  termNumber: number | null;
  subjectId: string;
  subjectName: string;
  subjectCode: string | null;
  status: TResultGroupStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  teacherName: string | null;
  fullMarks: number;
  passMarks: number;
  studentsCount: number;
  marksEntered: number;
  absentCount: number;
  passCount: number;
  passPercent: number;
};

type TGroupListBody = {
  success?: boolean;
  data?:
    | TResultGroup[]
    | {
        data?: TResultGroup[];
        pagination?: { page?: number; limit?: number; total?: number };
      };
};

/**
 * One aggregate request: every Batch -> Term -> Subject row the principal can
 * review. `limit: -1` asks the backend for all rows (no 999 sentinel).
 */
export async function listResultGroups(params: {
  batchId?: string;
  termId?: string;
  subjectId?: string;
  status?: string;
  search?: string;
}): Promise<{ groups: TResultGroup[]; total: number }> {
  const res = await axiosInstance.get(
    `${UrlConstants.EXAM_SUBJECT_URL}/groups`,
    {
      params: {
        page: 1,
        limit: -1,
        batchId: params.batchId || undefined,
        termId: params.termId || undefined,
        subjectId: params.subjectId || undefined,
        status: params.status || undefined,
        search: params.search || undefined,
      },
    },
  );
  const body = res.data as TGroupListBody;
  const payload = body?.data;
  const groups = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  const total = Array.isArray(payload)
    ? payload.length
    : (payload?.pagination?.total ?? groups.length);
  return { groups, total };
}

export async function reviewResultGroups(input: {
  action: "APPROVE" | "REJECT";
  batchId: string;
  termId: string;
  subjectId?: string;
  examId?: string;
  reason?: string;
}): Promise<{ action: string; updated: number }> {
  const res = await axiosInstance.post(
    `${UrlConstants.EXAM_SUBJECT_URL}/bulk-review`,
    input,
  );
  return res.data?.data;
}

export async function publishResultGroups(input: {
  batchId: string;
  termId: string;
  examId?: string;
}): Promise<{ published: number }> {
  const res = await axiosInstance.post(
    `${UrlConstants.EXAM_SUBJECT_URL}/bulk-publish`,
    input,
  );
  return res.data?.data;
}

/** Teacher side: submit this subject's marks for approval (or re-submit). */
export async function submitExamSubject(id: string) {
  const res = await axiosInstance.post(
    `${UrlConstants.EXAM_SUBJECT_URL}/${id}/submit`,
  );
  return res.data?.data;
}
