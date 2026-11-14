import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_FEE_HEAD = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
};

export type T_FEE_STRUCTURE_ITEM = {
  id: string;
  feeHeadId: string;
  /** null = one-time fee (e.g. admission fee). */
  termNumber?: number | null;
  amount: string | number;
  feeHead?: T_FEE_HEAD | null;
};

export type T_FEE_STRUCTURE = {
  id: string;
  courseId: string;
  /** null = the default structure of the course. */
  batchId?: string | null;
  name: string;
  isActive: boolean;
  createdAt?: string;
  items?: T_FEE_STRUCTURE_ITEM[];
  course?: { id: string; name: string; code?: string } | null;
  batch?: { id: string; name: string } | null;
};

export type T_FEE_STRUCTURE_ITEM_INPUT = {
  feeHeadId: string;
  termNumber?: number | null;
  amount: number;
};

export type T_FEE_STRUCTURE_INPUT = {
  courseId: string;
  batchId?: string | null;
  name: string;
  isActive?: boolean;
  items?: T_FEE_STRUCTURE_ITEM_INPUT[];
};

export type T_ASSIGN_RESULT = {
  assigned: number;
  skipped: number;
  failed: number;
  failures: { studentId: string; reason: string }[];
};

export async function listFeeStructures(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(
    `${UrlConstants.ACCOUNTANT_FEES_STRUCTURE_URL}`,
    { params },
  );
  return res.data;
}

export async function createFeeStructure(input: T_FEE_STRUCTURE_INPUT) {
  const res = await axiosInstance.post(
    `${UrlConstants.ACCOUNTANT_FEES_STRUCTURE_URL}`,
    input,
  );
  return res.data;
}

export async function updateFeeStructure(
  id: string,
  input: T_FEE_STRUCTURE_INPUT,
) {
  const res = await axiosInstance.patch(
    `${UrlConstants.ACCOUNTANT_FEES_STRUCTURE_URL}/${id}`,
    input,
  );
  return res.data;
}

export async function deleteFeeStructure(id: string) {
  const res = await axiosInstance.delete(
    `${UrlConstants.ACCOUNTANT_FEES_STRUCTURE_URL}/${id}`,
  );
  return res.data;
}

/** Assigns the structure to one student. */
export async function assignFeeStructureToStudent(input: {
  studentId: string;
  feeStructureId: string;
}) {
  const res = await axiosInstance.post(UrlConstants.STUDENT_FEE_URL, input);
  return res.data;
}

/** Assigns the structure to every student of a batch (or a list of students). */
export async function assignFeeStructureToStudents(input: {
  feeStructureId?: string;
  batchId?: string;
  studentIds?: string[];
}) {
  const res = await axiosInstance.post(
    `${UrlConstants.STUDENT_FEE_URL}/bulk`,
    input,
  );
  return res.data;
}

export async function listFeeHeadOptions() {
  const res = await axiosInstance.get(UrlConstants.ADMIN_LOOKUP_FEEHEAD_URL, {
    params: { page: 1, limit: -1 },
  });
  return res.data as {
    data?: { data?: T_FEE_HEAD[] };
  };
}

export async function listCourseOptions() {
  const res = await axiosInstance.get(UrlConstants.COURSE_URL, {
    params: { page: 1, limit: -1 },
  });
  return res.data as {
    data?: { data?: { id: string; name: string; code?: string }[] };
  };
}

export async function listBatchOptions() {
  const res = await axiosInstance.get(UrlConstants.BATCH_URL, {
    params: { page: 1, limit: -1 },
  });
  return res.data as {
    data?: { data?: { id: string; name: string; courseId?: string }[] };
  };
}

export async function listStudentOptions() {
  const res = await axiosInstance.get(UrlConstants.STUDENT_URL, {
    params: { page: 1, limit: -1 },
  });
  return res.data as {
    data?: {
      data?: {
        id: string;
        universityRegNo?: string;
        firstName?: string;
        middleName?: string | null;
        lastName?: string;
        batchId?: string;
      }[];
    };
  };
}
