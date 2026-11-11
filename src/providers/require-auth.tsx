import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/context/auth-context";
import ScreenLoader from "@/components/ui/screen-loader";
import type { T_Role } from "@/lib/models";

interface RequireAuthProps {
  allowedRoles?: T_Role[];
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { auth, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader />;
  }

  if (!auth?.token) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Teachers land on their own dashboard, everyone else on the generic one.
      return (
        <Navigate
          to={userRole === "TEACHER" ? "/teacher/dashboard" : "/dashboard"}
          replace
        />
      );
    }
  }

  return <Outlet />;
}
