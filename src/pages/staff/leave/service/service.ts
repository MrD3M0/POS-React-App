import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_LEAVE_ATTENDANCE = {
  id: string;
  employeeId: string;
  dateBs: string;
  status: "LEAVE";
  leaveTypeId?: string | null;
  remarks?: string | null;
  leaveType?: { id?: string; name?: string; code?: string } | null;
  createdAt?: string;
};

export type T_LEAVE_TYPE = {
  id: string;
  code: string;
  name: string;
  isPaid: boolean;
  isActive: boolean;
};

export async function listMyLeaves(params: { page: number; limit: number; search?: string; employeeId?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, {
    params: { ...params, status: "LEAVE" },
  });
  return res.data;
}

export async function listLeaveTypes(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.LEAVE_TYPE_URL}`, { params });
  return res.data;
}

export async function applyLeave(input: {
  employeeId: string;
  dateBs: string;
  leaveTypeId?: string;
  remarks?: string;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, {
    ...input,
    status: "LEAVE",
  });
  return res.data;
}
