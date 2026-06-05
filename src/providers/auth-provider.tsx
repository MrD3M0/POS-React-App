import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, type UserModel, type AuthModel } from "@/lib/models";
import axiosInstance from "@/lib/axios-request";
import { QUERY_KEYS } from "@/lib/query-keys";
import { UrlConstants } from "@/constants/endpoints";
import { AuthContext } from "@/auth/context/auth-context";

async function fetchCurrentUser(): Promise<UserModel> {
  const res = await axiosInstance.get(UrlConstants.ME_URL);
  return res.data.data as UserModel;
}

function readStoredAuth(): AuthModel | undefined {
  try {
    const raw = localStorage.getItem("token");
    return raw ? (JSON.parse(raw) as AuthModel) : undefined;
  } catch {
    return undefined;
  }
}
function applyTokenToAxios(token: string | undefined) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const qc = useQueryClient();

  const [auth, setAuth] = useState<AuthModel | undefined>(() => {
    const stored = readStoredAuth();
    return stored;
  });
  const token = getAuthToken(auth);

  const { data: currentUser, isLoading: userLoading } = useQuery<UserModel>({
    queryKey: [QUERY_KEYS.CURRENT_USER],
    queryFn: fetchCurrentUser,
    // Only run whule we actually have a token.
    enabled: !!token,
    // Consider the user data fresh for 5 minutes; background-refetch after that.
    staleTime: 5 * 60 * 1000,
    // Keep the cached value in memory for 10 minutes after the component unmounts.
    gcTime: 10 * 60 * 1000,
    // Don't hammer the server on transient network blips.
    retry: 1,
  });

  // loading is true only during the intial silent token verification
  const loading = !!token && userLoading && !currentUser;

  const isAdmin = currentUser?.role === "Admin";

  // ── keep axios header in sync whenever auth changes ───────────────────────
  useEffect(() => {
    applyTokenToAxios(token);
  }, [token]);

  // saveAuth
  const saveAuth = useCallback(
    (next: AuthModel | undefined) => {
      setAuth(next);
      if (next) {
        localStorage.setItem("token", JSON.stringify(next));
        applyTokenToAxios(getAuthToken(next));
        // If the login response already carries the user, seed the cache
        // directly so we never need to fire an extra /me request.
        if (next.user) {
          qc.setQueryData([QUERY_KEYS.CURRENT_USER], next.user);
        }
      } else {
        localStorage.removeItem("token");
        applyTokenToAxios(undefined);
        // Wipe the cached user so stale data can't leak to a next session.
        qc.removeQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
      }
    },
    [qc],
  );

  // login
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await axiosInstance.post(UrlConstants.LOGIN_URL, {
          email,
          password,
        });
        const authData: AuthModel = res.data;
        saveAuth(authData);
      } catch (error) {
        saveAuth(undefined);
        throw error;
      }
    },
    [saveAuth],
  );

  // Register
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const res = await axiosInstance.post(UrlConstants.REGISTER_URL, {
          username,
          email,
          password,
        });
        const authData: AuthModel = res.data;
        saveAuth(authData);
      } catch (error) {
        saveAuth(undefined);
        throw error;
      }
    },
    [saveAuth],
  );

  const value = useMemo(
    () => ({
      auth,
      login,
      register,
      isAdmin,
      loading,
      saveAuth,
    }),
    [auth, login, register, isAdmin, loading, saveAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
