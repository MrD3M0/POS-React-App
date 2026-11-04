import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { UrlConstants } from "@/constants/endpoints";
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
} from "./auth-storage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Create Axios Instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Pragma: "no-cache",
    "Cache-Control": "no-cache, no-store",
  },
});

// ── Request: always send the latest access token ────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = readStoredAuth()?.token;
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── Response: on 401 try ONE silent refresh, then retry the request ─────────
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// These endpoints must never trigger a refresh (would loop / is meaningless)
const NO_REFRESH_URLS: string[] = [
  UrlConstants.LOGIN_URL,
  UrlConstants.REFRESH_URL,
];

// If many requests fail at once, they all wait for the same refresh call
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const stored = readStoredAuth();
  if (!stored?.refreshToken) throw new Error("No refresh token");

  // Plain axios (not axiosInstance) so this call skips our interceptors
  const res = await axios.post<{ token: string; refreshToken?: string }>(
    `${baseURL}${UrlConstants.REFRESH_URL}`,
    { refreshToken: stored.refreshToken },
    { withCredentials: true },
  );

  writeStoredAuth({
    ...stored,
    token: res.data.token,
    refreshToken: res.data.refreshToken ?? stored.refreshToken,
  });
  return res.data.token;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? "";

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      NO_REFRESH_URLS.some((u) => url.includes(u))
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      original.headers.set("Authorization", `Bearer ${token}`);
      return axiosInstance(original);
    } catch {
      // Refresh failed -> session is over. AuthProvider listens and redirects.
      clearStoredAuth();
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
