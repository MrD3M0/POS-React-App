import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_CollectionSplit = {
  total: number;
  cash: number;
  bank: number;
  split: number;
};

export type T_AccountantKpis = {
  todayBs: string | null;
  month: { yearBs: number; monthBs: number; label: string } | null;
  collectionToday: T_CollectionSplit;
  collectionMonth: { total: number };
  outstanding: { total: number; students: number };
  expensesMonth: { total: number };
  payroll: {
    status: string;
    payslips: number;
    gross: number;
    yearBs: number | null;
    monthBs: number | null;
  };
  cash: { cashInHand: number; bankBalance: number };
};

export type T_TrendPoint = { month: string; label: string; total: number };

export type T_PendingByBatch = {
  batchId: string;
  batch: string;
  course: string;
  due: number;
  students: number;
};

export type T_FeeAnalytics = {
  trend: T_TrendPoint[];
  pendingByBatch: T_PendingByBatch[];
};

export type T_RecentPayment = {
  id: string;
  receiptNo: string;
  paymentDateBs: string;
  totalAmount: number;
  isCancelled: boolean;
  student: string;
  universityRegNo: string;
  batch: string;
  methods: string;
  isSplit: boolean;
};

export type T_OverdueStudent = {
  studentId: string;
  name: string;
  universityRegNo: string;
  batch: string;
  dueAmount: number;
  oldestDueBs: string;
  daysOverdue: number;
};

export type T_Collections = {
  recentPayments: T_RecentPayment[];
  overdueStudents: T_OverdueStudent[];
};

export type T_JournalEntry = {
  id: string;
  entryNo: string;
  dateBs: string;
  description: string;
  debit: number;
  credit: number;
  createdBy: string | null;
};

export type T_JournalSummary = {
  recentEntries: T_JournalEntry[];
  trialBalance: { debit: number; credit: number; balanced: boolean };
  balanceSheet: { assets: number; liabilities: number; equity: number };
};

export type T_PayrollSummary = {
  status: string;
  yearBs: number | null;
  monthBs: number | null;
  gross: number;
  deduction: number;
  net: number;
  payslipsGenerated: number;
  payslipsPending: number;
};

export type T_DashboardAlert = {
  key: string;
  label: string;
  severity: "info" | "warning" | "error";
  count: number;
  link: string;
};

export type T_PayrollAndAlerts = {
  payroll: T_PayrollSummary;
  alerts: T_DashboardAlert[];
  notices: { id: string; title: string; createdAt: string; role: string | null }[];
};

async function getSection<T>(path: string): Promise<T> {
  const res = await axiosInstance.get(
    `${UrlConstants.ACCOUNTANT_DASHBOARD_URL}/${path}`,
  );
  return res.data?.data as T;
}

export const getAccountantKpis = () => getSection<T_AccountantKpis>("kpis");

export const getAccountantFeeAnalytics = () =>
  getSection<T_FeeAnalytics>("fee-analytics");

export const getAccountantCollections = () =>
  getSection<T_Collections>("collections");

export const getAccountantJournal = () =>
  getSection<T_JournalSummary>("journal");

export const getAccountantPayrollAlerts = () =>
  getSection<T_PayrollAndAlerts>("payroll-alerts");
