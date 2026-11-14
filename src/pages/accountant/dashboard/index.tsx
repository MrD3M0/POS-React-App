import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarClock,
  HandCoins,
  Landmark,
  NotebookPen,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import { useAccountantDashboard } from "./hooks/use-accountant-dashboard";
import { formatNpr } from "@/lib/money";
import KpiCard from "./components/kpi-card";
import CollectionTrendChart from "./components/collection-trend-chart";
import PendingFeesChart from "./components/pending-fees-chart";
import RecentPaymentsTable from "./components/recent-payments-table";
import OverdueStudentsTable from "./components/overdue-students-table";
import RecentJournalList from "./components/recent-journal-list";
import TrialBalanceCard from "./components/trial-balance-card";
import BalanceSheetSnapshot from "./components/balance-sheet-snapshot";
import PayrollSummaryCard from "./components/payroll-summary-card";
import AlertsPanel from "./components/alerts-panel";
import PaymentMethodSplit from "./components/payment-method-split";
import OverdueInstallmentsCard from "./components/overdue-installments-card";

const QUICK_ACTIONS = [
  { label: "Collect Fee", to: "/accountant/billing/record", icon: HandCoins },
  {
    label: "Create Fee Structure",
    to: "/accountant/fee-structures",
    icon: NotebookPen,
  },
  { label: "Journal Entry", to: "/accountant/journal", icon: Receipt },
  { label: "Run Payroll", to: "/accountant/payroll", icon: Wallet },
];

/**
 * Accountant dashboard — read-only overview of the money of the college.
 *
 * The whole page comes from ONE request (`GET /dashboard/accountant`). Every
 * widget still renders its own loading, empty and error state from that single
 * query, so a failure is visible in place and never leaves a blank card.
 */
export default function AccountantDashboardPage() {
  const query = useAccountantDashboard();
  const data = query.data;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const retry = () => void query.refetch();

  const monthLabel = data?.kpis?.month?.label ?? "this month";

  return (
    <div className="p-5">
      <PageHeader
        title="Accountant Dashboard"
        description="Collections, dues, payroll and the books of the college."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Dashboard", link: "/accountant" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button key={action.to} asChild variant="outline" size="sm">
                <Link to={action.to}>
                  <action.icon className="size-3.5" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        }
      />

      {/* Row 1 — KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Today's Collection"
          value={formatNpr(data?.kpis?.collectionToday.total)}
          helper={`Cash ${formatNpr(data?.kpis?.collectionToday.cash)} · Bank ${formatNpr(data?.kpis?.collectionToday.bank)}`}
          icon={Banknote}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <KpiCard
          title={`Collection — ${monthLabel}`}
          value={formatNpr(data?.kpis?.collectionMonth.total)}
          helper="Received in the current BS month"
          icon={TrendingUp}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <KpiCard
          title="Outstanding Fees"
          value={formatNpr(data?.kpis?.outstanding.total)}
          helper={`${data?.kpis?.outstanding.students ?? 0} student(s) with dues`}
          icon={Receipt}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <KpiCard
          title={`Expenses — ${monthLabel}`}
          value={formatNpr(data?.kpis?.expensesMonth.total)}
          helper="Posted on expense accounts"
          icon={CalendarClock}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <KpiCard
          title="Payroll Status"
          value={data?.kpis?.payroll.status ?? "NOT_STARTED"}
          helper={`${data?.kpis?.payroll.payslips ?? 0} payslip(s) generated`}
          icon={Wallet}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <KpiCard
          title="Cash & Bank"
          value={formatNpr(
            (data?.kpis?.cash.cashInHand ?? 0) +
              (data?.kpis?.cash.bankBalance ?? 0),
          )}
          helper={`In hand ${formatNpr(data?.kpis?.cash.cashInHand)} · Bank ${formatNpr(data?.kpis?.cash.bankBalance)}`}
          icon={Landmark}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
      </div>

      {/* Row 2 — charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollectionTrendChart
            data={data?.feeAnalytics?.trend ?? []}
            isLoading={isLoading}
            isError={isError}
            onRetry={retry}
          />
        </div>
        <PendingFeesChart
          data={data?.feeAnalytics?.pendingByBatch ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
      </div>

      {/* Row 3 — payments + overdue students */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentPaymentsTable
          data={data?.collections?.recentPayments ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <OverdueStudentsTable
          data={data?.collections?.overdueStudents ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
      </div>

      {/* Row 4 — journal, trial balance, balance sheet */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecentJournalList
          data={data?.journal?.recentEntries ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <TrialBalanceCard
          debit={data?.journal?.trialBalance.debit ?? 0}
          credit={data?.journal?.trialBalance.credit ?? 0}
          balanced={data?.journal?.trialBalance.balanced ?? true}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <BalanceSheetSnapshot
          assets={data?.journal?.balanceSheet.assets ?? 0}
          liabilities={data?.journal?.balanceSheet.liabilities ?? 0}
          equity={data?.journal?.balanceSheet.equity ?? 0}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
      </div>

      {/* Row 5 — payroll + alerts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PayrollSummaryCard
          payroll={data?.payrollAndAlerts?.payroll}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <AlertsPanel
          data={data?.payrollAndAlerts}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
      </div>

      {/* Row 6 — payment methods + overdue installments */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PaymentMethodSplit
          data={data?.paymentMethodSplit ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
        <OverdueInstallmentsCard
          data={data?.overdueInstallments}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
        />
      </div>
    </div>
  );
}
