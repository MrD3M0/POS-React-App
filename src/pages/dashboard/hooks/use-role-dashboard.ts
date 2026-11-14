import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getRoleDashboard, type TDashboardRole } from "../service/role-dashboard";

/** One aggregate request per role dashboard. */
export function useRoleDashboard<T>(role: TDashboardRole) {
  return useQuery({
    queryKey: [QUERY_KEYS.ROLE_DASHBOARD, role],
    queryFn: () => getRoleDashboard<T>(role),
    staleTime: 60_000,
  });
}
