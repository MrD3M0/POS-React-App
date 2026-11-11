import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAccountantCollections,
  getAccountantFeeAnalytics,
  getAccountantJournal,
  getAccountantKpis,
  getAccountantPayrollAlerts,
} from "../service/service";

/**
 * One query per dashboard section, so every card has its own loading, empty
 * and error state — a failing section never blocks the others.
 */
export function useAccountantDashboard() {
  const kpis = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_DASHBOARD, "kpis"],
    queryFn: getAccountantKpis,
    staleTime: 60_000,
  });

  const feeAnalytics = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_DASHBOARD, "fee-analytics"],
    queryFn: getAccountantFeeAnalytics,
    staleTime: 60_000,
  });

  const collections = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_DASHBOARD, "collections"],
    queryFn: getAccountantCollections,
    staleTime: 60_000,
  });

  const journal = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_DASHBOARD, "journal"],
    queryFn: getAccountantJournal,
    staleTime: 60_000,
  });

  const payrollAlerts = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_DASHBOARD, "payroll-alerts"],
    queryFn: getAccountantPayrollAlerts,
    staleTime: 60_000,
  });

  return { kpis, feeAnalytics, collections, journal, payrollAlerts };
}
