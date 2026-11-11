import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_AUDIT_LOG = {
  id: string;
  entity: string;
  entityId?: string | null;
  action: string;
  oldValues?: unknown;
  newValues?: unknown;
  userId?: string | null;
  user?: { id: string; email: string; username?: string | null; role: string } | null;
  ipAddress?: string | null;
  createdAt?: string;
};

export async function listAuditLogs(params: {
  page: number;
  limit: number;
  search?: string;
  entity?: string;
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
}) {
  const res = await axiosInstance.get(UrlConstants.ADMIN_AUDIT_LOG_URL, { params });
  return res.data;
}
