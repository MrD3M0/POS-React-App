import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_ATT_STATUS = "PRESENT" | "ABSENT" | "LEAVE" | "LATE";

export type T_ATT = {
  id: string;
  employeeId: string;
  dateBs: string;
  status: T_ATT_STATUS;
  remarks?: string | null;
  leaveTypeId?: string | null;
  employee?: {
    id?: string;
    employeeCode?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    designation?: string;
  } | null;
  leaveType?: { id?: string; name?: string; code?: string } | null;
};

export type T_ATT_LIST = {
  rows: T_ATT[];
  total: number;
};

export type T_LEAVE_TYPE = {
  id: string;
  code?: string;
  name: string;
  isPaid?: boolean;
};

type T_ATT_QUERY = {
  page: number;
  limit: number;
  employeeId?: string;
  dateBs?: string;
  status?: string;
};

/** GET /employee-attendance — the API wraps list payloads in data.data. */
export async function listAttendance(params: T_ATT_QUERY): Promise<T_ATT_LIST> {
  const res = await axiosInstance.get(
    `${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        employeeId: params.employeeId || undefined,
        dateBs: params.dateBs || undefined,
        status: params.status || undefined,
      },
    },
  );

  const payload = res.data as {
    data?: T_ATT[] | { data?: T_ATT[]; pagination?: { total?: number } };
  };
  const data = payload.data;
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  const total = Array.isArray(data)
    ? rows.length
    : (data?.pagination?.total ?? rows.length);

  return { rows, total };
}

/** POST /employee-attendance — requires dateBs + status (and a leaveType for LEAVE). */
export async function markAttendance(input: {
  employeeId: string;
  dateBs: string;
  status: T_ATT_STATUS;
  leaveTypeId?: string;
  remarks?: string;
}) {
  const res = await axiosInstance.post(
    `${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`,
    {
      employeeId: input.employeeId,
      dateBs: input.dateBs,
      status: input.status,
      leaveTypeId: input.status === "LEAVE" ? input.leaveTypeId : null,
      remarks: input.remarks?.trim() || null,
    },
  );
  return res.data;
}

export async function listLeaveTypes(): Promise<T_LEAVE_TYPE[]> {
  const res = await axiosInstance.get(`${UrlConstants.LEAVE_TYPE_URL}`, {
    params: { page: 1, limit: -1 },
  });
  const payload = res.data as {
    data?: T_LEAVE_TYPE[] | { data?: T_LEAVE_TYPE[] };
  };
  const data = payload.data;
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
}
