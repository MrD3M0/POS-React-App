import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_AUDIT_LOG = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  actorId?: string;
  details?: string;
  createdAt?: string;
};

export async function listAuditLogs(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.AUDIT_LOG_URL}`, { params });
  return res.data as never;
}
