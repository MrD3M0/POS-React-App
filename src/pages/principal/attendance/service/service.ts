import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PRINCIPAL_ATTENDANCE_STATUS = "PRESENT" | "ABSENT" | "LEAVE" | "HALF DAY";

export type T_PRINCIPAL_ATTENDANCE = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  designation?: string;
  date?: string;
  status?: string;
  mark?: string;
  employee?: {
    id?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    designation?: string;
  } | null;
};

export async function listPrincipalAttendance(params: {
  page: number;
  limit: number;
  search?: string;
  employeeId?: string;
  dateBs?: string;
  status?: string;
}) {
  const cleaned: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    employeeId: params.employeeId || undefined,
    dateBs: params.dateBs || undefined,
    status: params.status && params.status !== "ALL" ? params.status : undefined,
  };
  const res = await axiosInstance.get(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, { params: cleaned });
  return res.data;
}
