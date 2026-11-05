import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/context/auth-context";
import ScreenLoader from "@/components/ui/screen-loader";
import type { PermissionKey } from "@/auth/permissions";
import { useCan } from "@/auth/permissions";

/**
 * `<ProtectedRoute permission="module:action" />`
 *
 * Used inside route configs to guard a route behind a single permission.
 * - Unauthenticated users are redirected to /login.
 * - Authenticated users lacking the permission see a 403 page.
 *
 * Front-end checks are UX only — the backend enforces everything again.
 */
export function ProtectedRoute({ permission }: { permission: PermissionKey }) {
  const { auth, loading } = useAuth();
  const location = useLocation();
  const can = useCan(permission);

  if (loading) return <ScreenLoader />;

  if (!auth?.token) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!can) {
    return <Navigate to="/403" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

/**
 * Convenience wrapper: guards by role(s) instead of a single permission.
 * Useful for pages that any of several roles may access.
 */
export function ProtectedRoleRoute({
  allowedRoles,
}: {
  allowedRoles: string[];
}) {
  const { auth, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <ScreenLoader />;

  if (!auth?.token) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
