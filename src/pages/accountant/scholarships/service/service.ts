import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_SCHOLARSHIP = {
  id: string;
  name: string;
  code?: string | null;
  type: "PERCENT" | "FIXED";
  value: string | number;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  _count?: { grants: number };
};

export type T_SCHOLARSHIP_GRANT = {
  id: string;
  scholarshipId: string;
  grantGroupId: string;
  studentId: string;
  studentFeeId?: string | null;
  studentFeeItemId?: string | null;
  amount: string | number;
  note?: string | null;
  grantedAt?: string;
  revokedAt?: string | null;
  scholarship?: T_SCHOLARSHIP;
  student?: {
    id: string;
    universityRegNo?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
  } | null;
  studentFeeItem?: {
    id: string;
    amount?: string | number;
    netAmount?: string | number;
    discountAmount?: string | number;
    feeHead?: { id: string; name: string; code?: string } | null;
  } | null;
};

export type T_SCHOLARSHIP_INPUT = {
  name: string;
  code?: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  description?: string | null;
  isActive?: boolean;
};

export type T_GRANT_INPUT = {
  scholarshipId: string;
  studentId: string;
  studentFeeId?: string;
  feeItemIds?: string[];
  note?: string | null;
};

export async function listScholarships(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(`${UrlConstants.SCHOLARSHIP_URL}`, {
    params,
  });
  return res.data;
}

export async function createScholarship(input: T_SCHOLARSHIP_INPUT) {
  const res = await axiosInstance.post(
    `${UrlConstants.SCHOLARSHIP_URL}`,
    input,
  );
  return res.data;
}

export async function updateScholarship(
  id: string,
  input: Partial<T_SCHOLARSHIP_INPUT>,
) {
  const res = await axiosInstance.patch(
    `${UrlConstants.SCHOLARSHIP_URL}/${id}`,
    input,
  );
  return res.data;
}

export async function deleteScholarship(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.SCHOLARSHIP_URL}/${id}`);
  return res.data;
}

export async function listScholarshipGrants(params: {
  page: number;
  limit: number;
  search?: string;
  studentId?: string;
}) {
  const res = await axiosInstance.get(
    `${UrlConstants.SCHOLARSHIP_URL}/grants`,
    { params },
  );
  return res.data;
}

export async function grantScholarship(input: T_GRANT_INPUT) {
  const res = await axiosInstance.post(
    `${UrlConstants.SCHOLARSHIP_URL}/grants`,
    input,
  );
  return res.data;
}

export async function revokeScholarshipGrant(grantId: string) {
  const res = await axiosInstance.post(
    `${UrlConstants.SCHOLARSHIP_URL}/grants/${grantId}/revoke`,
    {},
  );
  return res.data;
}
