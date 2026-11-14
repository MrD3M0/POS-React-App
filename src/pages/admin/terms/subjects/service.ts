import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_TERM_SUBJECT = {
  id: string;
  batchTermId: string;
  subjectId: string;
  creditHour: number | string;
  isElective: boolean;
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
}) {
  const res = await axiosInstance.post(
    UrlConstants.BATCH_TERM_SUBJECT_URL,
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

export async function getTerm(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.BATCH_TERM_URL}/${id}`);
  return (res.data as { data?: { name?: string; batchId?: string } })?.data;
}
