import { useAuth } from "@/auth/context/auth-context";
import { hasPermission, type PermissionKey } from "@/auth/permission-map";

/** True when the signed-in user's role holds the given permission. */
export function useCan(permission: PermissionKey): boolean {
  const { user } = useAuth();
  return hasPermission(user?.role, permission);
}
