import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_EMPLOYEE_ATTENDANCE = {
  id: string;
  employeeId: string;
  dateBs: string;
  status: string;
  leaveTypeId?: string | null;
  remarks?: string | null;
  leaveType?: { id?: string; name?: string; code?: string } | null;
  createdAt?: string;
};

export async function listMyAttendance(params: {
  page: number;
  limit: number;
  search?: string;
  employeeId?: string;
}) {
  const res = await axiosInstance.get(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, {
    params,
  });
  return res.data;
}
