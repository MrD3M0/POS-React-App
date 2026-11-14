import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_LOOKUP = {
  id: string;
  code?: string;
  name?: string;
  grade?: string;
  periodNumber?: number;
  type?: string;
  isActive?: boolean;
  active?: boolean;
  isPaid?: boolean;
  yearlyAllowed?: number | null;
  startTime?: string;
  endTime?: string;
  minPercent?: string;
  maxPercent?: string;
  gradePoint?: string;
  description?: string;
  isPassGrade?: boolean;
  isDeduction?: boolean;
  isEmployerContribution?: boolean;
  isTaxable?: boolean;
  isGroup?: boolean;
};

const LOOKUP_URLS: Record<string, string> = {
  leaveType: UrlConstants.ADMIN_LOOKUP_LEAVE_URL,
  period: UrlConstants.ADMIN_LOOKUP_PERIOD_URL,
  examType: UrlConstants.ADMIN_LOOKUP_EXAM_URL,
  gradeScale: UrlConstants.ADMIN_LOOKUP_GRADE_URL,
  feeHead: UrlConstants.ADMIN_LOOKUP_FEEHEAD_URL,
  paymentMethod: UrlConstants.ADMIN_LOOKUP_METHOD_URL,
  salaryComponent: UrlConstants.ADMIN_LOOKUP_COMPONENT_URL,
  chartAccount: UrlConstants.ADMIN_LOOKUP_ACCOUNT_URL,
};

export const urlFor = (type: string): string =>
  LOOKUP_URLS[type] ?? UrlConstants.ADMIN_LOOKUP_LEAVE_URL;

export async function listLookups(params: { type: string; page: number; limit: number; search?: string }) {
  const { type, ...rest } = params;
  const res = await axiosInstance.get(`${urlFor(type)}`, { params: rest });
  return res.data;
}

export async function getLookupById(type: string, id: string): Promise<{ data: T_LOOKUP }> {
  const res = await axiosInstance.get(`${urlFor(type)}/${id}`);
  return res.data;
}

export async function createLookup(type: string, input: Record<string, unknown>): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${urlFor(type)}`, input);
  return res.data;
}

export async function updateLookup(type: string, id: string, input: Record<string, unknown>): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${urlFor(type)}/${id}`, input);
  return res.data;
}

export async function deleteLookup(type: string, id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${urlFor(type)}/${id}`);
  return res.data;
}
