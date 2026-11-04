import type { AuthModel } from "@/lib/models";

// Single place that knows how the session is stored in the browser.
// Used by the AuthProvider AND the axios interceptors (token refresh),
// so both always see the same data.
export const AUTH_STORAGE_KEY = "token";
export const AUTH_CHANGED_EVENT = "auth:changed";

export function readStoredAuth(): AuthModel | undefined {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthModel) : undefined;
  } catch {
    return undefined;
  }
}

export function writeStoredAuth(next: AuthModel) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
