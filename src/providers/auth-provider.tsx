import { useEffect, useState, useCallback, type ReactNode } from "react";
import { AuthContext } from "@/auth/context/auth-context";
import type { AuthModel, UserModel } from "@/lib/models";
import {
  readStoredAuth,
  writeStoredAuth,
  clearStoredAuth,
  AUTH_CHANGED_EVENT,
} from "@/lib/auth-storage";

import ScreenLoader from "@/components/ui/screen-loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/auth/service/service";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthModel | undefined>(() =>
    readStoredAuth(),
  );
  const [user, setUser] = useState<UserModel | undefined>(
    () => readStoredAuth()?.user,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState<boolean>(false);

  // Sync auth state across tabs and local storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = readStoredAuth();
      setAuth(stored);
      setUser(stored?.user);
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Rehydrate session on app load
  useEffect(() => {
    const initAuth = async () => {
      const stored = readStoredAuth();
      if (stored?.token) {
        try {
          const freshUser = await getCurrentUser();
          setUser(freshUser.data);
          writeStoredAuth({ ...stored, user: freshUser.data });
        } catch {
          clearStoredAuth();
          setAuth(undefined);
          setUser(undefined);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      const authModel: AuthModel = {
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
      };
      writeStoredAuth(authModel);
      setAuth(authModel);
      setUser(data.user);
      return authModel;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ask for confirmation before logging out; the actual logout runs on confirm.
  const logout = useCallback(async () => {
    setLogoutConfirmOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch {
      // Proceed with local cleanup even if server request fails
    } finally {
      clearStoredAuth();
      setAuth(undefined);
      setUser(undefined);
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      return await registerUser(username, email, password);
    },
    [],
  );

  const isAdmin =
    user?.role === "ADMIN" || user?.email?.includes("admin") || false;

  if (loading && !auth?.token) {
    return <ScreenLoader />;
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        register,
        auth,
        user,
        isAdmin,
        loading,
      }}
    >
      {children}

      {/* Confirmation dialog shown for every logout entry point */}
      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setLogoutConfirmOpen(false);
                void confirmLogout();
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
}
