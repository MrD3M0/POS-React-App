import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_EXAM_SUBJECT = {
  id: string;
  examId?: string;
  batchTermSubjectId?: string;
  fullMarks?: number | string;
  passMarks?: number | string;
  examDateBs?: string | null;
  exam?: { id?: string; name?: string } | null;
  teachingAssignment?: {
    id?: string;
    teacher?: {
      employee?: {
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        employeeCode?: string | null;
      } | null;
    } | null;
    batchTermSubject?: {
      subject?: { code?: string; name?: string } | null;
      batchTerm?: {
        name?: string | null;
        termNumber?: number | null;
        batch?: { name?: string } | null;
      } | null;
    } | null;
  } | null;
  batchTermSubject?: {
    id?: string;
    creditHour?: number | string;
    subject?: { code?: string; name?: string } | null;
    batchTerm?: {
      name?: string | null;
      termNumber?: number | null;
      batch?: { name?: string } | null;
    } | null;
    assignments?: Array<{
      teacher?: {
        employee?: {
          firstName?: string | null;
          middleName?: string | null;
          lastName?: string | null;
          employeeCode?: string | null;
        } | null;
      } | null;
    }> | null;
  } | null;
  [key: string]: unknown;
};

export type T_BATCH_TERM_SUBJECT = {
  id: string;
  creditHour?: number | string;
  subject?: { code?: string; name?: string } | null;
  batchTerm?: {
    termNumber?: number;
    name?: string;
    batch?: { name?: string } | null;
  } | null;
  assignments?: Array<{
    teacher?: {
      employee?: {
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        employeeCode?: string | null;
      } | null;
    } | null;
  }> | null;
  [key: string]: unknown;
};

export async function listExamSubjects(params: {
  page: number;
  limit: number;
  search?: string;
  examId?: string;
}) {
  const cleaned: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    examId: params.examId || undefined,
  };
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHER_EXAM_SUBJECTS_URL}`,
    { params: cleaned },
  );
  return res.data;
}

export async function createExamSubject(input: Record<string, unknown>) {
  const res = await axiosInstance.post(
    `${UrlConstants.TEACHER_EXAM_SUBJECTS_URL}`,
    input,
  );
  return res.data;
}

export async function getExamSubjectById(id: string) {
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHER_EXAM_SUBJECTS_URL}/${id}`,
  );
  return res.data;
}

export async function updateExamSubject(
  id: string,
  input: Record<string, unknown>,
) {
  const res = await axiosInstance.patch(
    `${UrlConstants.TEACHER_EXAM_SUBJECTS_URL}/${id}`,
    input,
  );
  return res.data;
}

export async function deleteExamSubject(
  id: string,
): Promise<{ message: string }> {
  const res = await axiosInstance.delete(
    `${UrlConstants.TEACHER_EXAM_SUBJECTS_URL}/${id}`,
  );
  return res.data;
}
export async function listBatchTermSubjects(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(
    `${UrlConstants.BATCH_TERM_SUBJECT_URL}`,
    { params },
  );
  return res.data;
}
