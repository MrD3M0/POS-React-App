import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

/** Mirrors SettingDef from the backend registry (src/lib/settings.ts). */
export type T_SETTING_DEF = {
  type: "number" | "enum" | "string";
  defaultValue: string;
  values?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  label: string;
  group: "attendance" | "payroll" | "college" | "fees";
  description: string;
  legacyValues?: string[];
};

/** College identity printed on student ID cards (readable by every role). */
export type T_INSTITUTION = {
  affiliation: string;
  name: string;
  address: string;
  phone: string;
  since: string;
  website: string;
  email: string;
  pan: string;
  programmes: string[];
  logoUrl: string;
  signatureUrl: string;
  signatureLabel: string;
};

export type T_EFFECTIVE_SETTING = {
  id: string | null;
  key: string;
  value: string;
  description: string;
  isDefault: boolean;
  updatedAt: string | null;
  definition: T_SETTING_DEF;
};

/**
 * All known settings with their effective value (stored value or registry
 * default) and the definition that drives the UI control for each one.
 */
export async function listEffectiveSettings(): Promise<{
  data?: T_EFFECTIVE_SETTING[];
}> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SETTING_URL}/effective`);
  return res.data;
}

/**
 * Public college identity (logo, affiliation, contacts) used on printed
 * documents. Unlike `/setting/effective`, every signed-in role may read it.
 */
export async function getInstitution(): Promise<{ data: T_INSTITUTION }> {
  const res = await axiosInstance.get(UrlConstants.INSTITUTION_URL);
  return res.data;
}

/**
 * Saves one setting by key (upsert). Values are validated by the backend
 * registry; settings still at their default have no row yet, so this
 * creates it — PATCH by id would 404 for those.
 */
export async function upsertSettingByKey(
  key: string,
  value: string,
): Promise<{ data?: T_SETTING }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_SETTING_URL}/key/${key}`, { value });
  return res.data;
}

export type T_SETTING = {
  id?: string;
  key: string;
  value: string;
  description?: string | null;
};

export async function listSettings(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SETTING_URL}`, { params });
  return res.data;
}

export async function getSettingById(id: string): Promise<{ data: T_SETTING }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SETTING_URL}/${id}`);
  return res.data;
}

export async function createSetting(payload: Partial<T_SETTING>) {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_SETTING_URL}`, payload);
  return res.data;
}

export async function updateSetting(id: string, payload: Partial<T_SETTING>) {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_SETTING_URL}/${id}`, payload);
  return res.data;
}

export async function deleteSetting(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_SETTING_URL}/${id}`);
  return res.data;
}
