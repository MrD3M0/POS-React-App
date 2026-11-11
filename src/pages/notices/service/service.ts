import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_NOTICE_TARGET = {
  role?: string | null;
  batchId?: string | null;
};

export type T_NOTICE_AUDIENCE = {
  /** EVERYONE = no target rows (the whole college sees it). */
  mode: "EVERYONE" | "TARGETED";
  roles: string[];
  batchIds: string[];
};

export type T_NOTICE = {
  id: string;
  title: string;
  body: string;
  content?: string;
  isPinned?: boolean;
  isPublished: boolean;
  published?: boolean;
  attachmentUrl?: string | null;
  expiresOnBs?: string | null;
  createdAt?: string;
  publishedAt?: string | null;
  targets?: T_NOTICE_TARGET[];
};

export type T_NOTICE_INPUT = {
  title: string;
  body: string;
  attachmentUrl?: string | null;
  expiresOnBs?: string | null;
  isPinned?: boolean;
  isPublished?: boolean;
  targets?: T_NOTICE_TARGET[];
};

export const NOTICE_ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STAFF", label: "Staff" },
  { value: "STUDENT", label: "Student" },
];

/** Turns the audience picker state into the API `targets` rows. */
export function audienceToTargets(
  audience: T_NOTICE_AUDIENCE,
): T_NOTICE_TARGET[] {
  if (audience.mode === "EVERYONE") return [];
  const targets: T_NOTICE_TARGET[] = [];
  for (const role of audience.roles) targets.push({ role, batchId: null });
  for (const batchId of audience.batchIds) targets.push({ role: null, batchId });
  return targets;
}

/** Turns the API `targets` rows back into the audience picker state. */
export function targetsToAudience(
  targets?: T_NOTICE_TARGET[] | null,
): T_NOTICE_AUDIENCE {
  const rows = targets ?? [];
  const roles = rows
    .map((t) => t.role)
    .filter((role): role is string => Boolean(role));
  const batchIds = rows
    .map((t) => t.batchId)
    .filter((id): id is string => Boolean(id));
  if (roles.length === 0 && batchIds.length === 0) {
    return { mode: "EVERYONE", roles: [], batchIds: [] };
  }
  return { mode: "TARGETED", roles, batchIds };
}

export async function listNotices(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(`${UrlConstants.NOTICE_URL}`, { params });
  return res.data;
}

export async function getNoticeById(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.NOTICE_URL}/${id}`);
  return res.data;
}

export async function createNotice(input: T_NOTICE_INPUT) {
  const res = await axiosInstance.post(`${UrlConstants.NOTICE_URL}`, input);
  return res.data;
}

export async function updateNotice(
  id: string,
  input: Partial<T_NOTICE_INPUT>,
) {
  const res = await axiosInstance.patch(`${UrlConstants.NOTICE_URL}/${id}`, input);
  return res.data;
}

export async function publishNotice(id: string) {
  const res = await axiosInstance.post(
    `${UrlConstants.NOTICE_URL}/${id}/publish`,
    {},
  );
  return res.data;
}

export async function unpublishNotice(id: string) {
  const res = await axiosInstance.post(
    `${UrlConstants.NOTICE_URL}/${id}/unpublish`,
    {},
  );
  return res.data;
}

export async function deleteNotice(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.NOTICE_URL}/${id}`);
  return res.data;
}

/** Every batch (class) of the college — used by the admin/principal/accountant audience picker. */
export async function listAudienceBatches() {
  const res = await axiosInstance.get(`${UrlConstants.BATCH_URL}`, {
    params: { page: 1, limit: 500 },
  });
  return res.data;
}

/** The classes the signed-in teacher teaches — used by the teacher audience picker. */
export async function listMyTeachingClasses() {
  const res = await axiosInstance.get(`${UrlConstants.TEACHING_ASSIGNMENT_URL}`, {
    params: { page: 1, limit: 500 },
  });
  return res.data;
}
