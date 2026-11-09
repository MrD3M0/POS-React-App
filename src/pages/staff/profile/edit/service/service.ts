import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_STAFF_UPDATE = {
  firstName: string;
  lastName: string;
  phone?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  department?: string;
};

export async function getOwnStaff(): Promise<{ data: Record<string, any> }> {
  const res = await axiosInstance.get(`${UrlConstants.STAFF_URL}/me`);
  return res.data;
}

export async function updateStaff(id: string, input: T_STAFF_UPDATE): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.STAFF_URL}/${id}`, input);
  return res.data;
}
