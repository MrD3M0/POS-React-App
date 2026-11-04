import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/context/auth-context";
import ScreenLoader from "@/components/ui/screen-loader";

export function RequireGuest() {
  const { auth, loading } = useAuth();

  if (loading) {
    return <ScreenLoader />;
  }

  if (auth?.token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
