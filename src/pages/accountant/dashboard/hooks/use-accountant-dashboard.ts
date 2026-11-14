import { useRoleDashboard } from "@/pages/dashboard/hooks/use-role-dashboard";
import type {
  T_AccountantKpis,
  T_Collections,
  T_FeeAnalytics,
  T_JournalSummary,
  T_PayrollAndAlerts,
  T_TrendPoint,
} from "../service/service";

/** Everything `GET /dashboard/accountant` returns in ONE request. */
export type T_AccountantDashboard = {
  todayBs: string;
  fiscalYear: {
    id: string;
    name: string;
    startDateBs: string;
    endDateBs: string;
  } | null;
  kpis: T_AccountantKpis;
  feeAnalytics: T_FeeAnalytics;
  collections: T_Collections;
  journal: T_JournalSummary;
  payrollAndAlerts: T_PayrollAndAlerts;
  overdueInstallments: { count: number; total: number };
  paymentMethodSplit: { code: string; name: string; total: number }[];
  fiscalYearTrend: T_TrendPoint[];
};

/**
 * ONE aggregate request for the whole accountant dashboard
 * (`GET /dashboard/accountant`). The page then renders every card from the
 * same payload and passes the same loading/error state down, so a failed
 * request shows a retry inside each widget instead of a blank page.
 */
export function useAccountantDashboard() {
  return useRoleDashboard<T_AccountantDashboard>("accountant");
}
