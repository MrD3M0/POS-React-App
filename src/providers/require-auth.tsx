import { useAuth } from "@/auth/context/auth-context";
import ScreenLoader from "@/components/ui/screen-loader";
import { getAuthToken } from "@/lib/models";
import { Navigate, Outlet } from "react-router-dom";

export const RequireAuth = () => {
  const { auth, loading } = useAuth();

  if (loading) {
    return <ScreenLoader />;
  }

  if (!getAuthToken(auth)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};
