import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_ATT = {
  employeeId: string;
  employeeName: string;
  designation?: string;
  date: string;
  mark: "PRESENT" | "ABSENT" | "HALF DAY" | "LEAVE";
};

export type T_ATTendanceList = T_ATT[];

export async function listAttendance(params: { employeeId: string; date: string }) {
  const res = await axiosInstance.get(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, {
    params,
  });
  return res.data as T_ATTendanceList;
}

export async function markAttendance(input: { employeeId: string; date: string; mark: "PRESENT" | "ABSENT" | "HALF DAY" | "LEAVE" }) {
  const res = await axiosInstance.post(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, input);
  return res.data as never;
}