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

const QUICK_ACTIONS = [
  { label: "Collect Fee", to: "/accountant/billing/record", icon: HandCoins },
  {
    label: "Create Fee Structure",
    to: "/accountant/fee-structures",
    icon: NotebookPen,
  },
  {
    label: "Manual Journal Entry",
    to: "/accountant/journal",
    icon: Receipt,
  },
  { label: "Generate Payroll", to: "/accountant/payroll/wizard", icon: Wallet },
];

/**
 * Accountant dashboard — read-only overview of the money of the college.
 * Every section loads on its own, so a failing card never blocks the page.
 */
export default function AccountantDashboardPage() {
  const { kpis, feeAnalytics, collections, journal, payrollAlerts } =
    useAccountantDashboard();

  const data = kpis.data;
  const monthLabel = data?.month?.label ?? "this month";

  return (
    <div className="p-5">
      <PageHeader
        title="Accountant Dashboard"
        description="Collections, dues, payroll and the books of the college."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/dashboard" },
          { title: "Dashboard", link: "/accountant/dashboard" },
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
          value={formatNpr(data?.collectionToday.total)}
          helper={`Cash ${formatNpr(data?.collectionToday.cash)} · Bank ${formatNpr(data?.collectionToday.bank)}`}
          icon={Banknote}
          isLoading={kpis.isLoading}
          isError={kpis.isError}
          onRetry={() => void kpis.refetch()}
        />
        <KpiCard
          title={`Collection — ${monthLabel}`}
          value={formatNpr(data?.collectionMonth.total)}
          helper="Received in the current BS month"
          icon={TrendingUp}
          isLoading={kpis.isLoading}
          isError={kpis.isError}
          onRetry={() => void kpis.refetch()}
        />
        <KpiCard
          title="Outstanding Fees"
          value={formatNpr(data?.outstanding.total)}
          helper={`${data?.outstanding.students ?? 0} student(s) with dues`}
          icon={Receipt}
          isLoading={kpis.isLoading}
          isError={kpis.isError}
          onRetry={() => void kpis.refetch()}
        />
        <KpiCard
          title={`Expenses — ${monthLabel}`}
          value={formatNpr(data?.expensesMonth.total)}
          helper="Posted on expense accounts"
          icon={CalendarClock}
          isLoading={kpis.isLoading}
          isError={kpis.isError}
          onRetry={() => void kpis.refetch()}
        />
        <KpiCard
          title="Payroll Status"
          value={data?.payroll.status ?? "NOT_STARTED"}
          helper={`${data?.payroll.payslips ?? 0} payslip(s) generated`}
          icon={Wallet}
          isLoading={kpis.isLoading}
          isError={kpis.isError}
          onRetry={() => void kpis.refetch()}
        />
        <KpiCard
          title="Cash & Bank"
          value={formatNpr((data?.cash.cashInHand ?? 0) + (data?.cash.bankBalance ?? 0))}
          helper={`In hand ${formatNpr(data?.cash.cashInHand)} · Bank ${formatNpr(data?.cash.bankBalance)}`}
          icon={Landmark}
          isLoading={kpis.isLoading}
          isError={kpis.isError}
          onRetry={() => void kpis.refetch()}
        />
      </div>

      {/* Row 2 — charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollectionTrendChart
            data={feeAnalytics.data?.trend ?? []}
            isLoading={feeAnalytics.isLoading}
            isError={feeAnalytics.isError}
            onRetry={() => void feeAnalytics.refetch()}
          />
        </div>
        <PendingFeesChart
          data={feeAnalytics.data?.pendingByBatch ?? []}
          isLoading={feeAnalytics.isLoading}
          isError={feeAnalytics.isError}
          onRetry={() => void feeAnalytics.refetch()}
        />
      </div>

      {/* Row 3 — payments + overdue students */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentPaymentsTable
          data={collections.data?.recentPayments ?? []}
          isLoading={collections.isLoading}
          isError={collections.isError}
          onRetry={() => void collections.refetch()}
        />
        <OverdueStudentsTable
          data={collections.data?.overdueStudents ?? []}
          isLoading={collections.isLoading}
          isError={collections.isError}
          onRetry={() => void collections.refetch()}
        />
      </div>

      {/* Row 4 — journal, trial balance, balance sheet */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecentJournalList
          data={journal.data?.recentEntries ?? []}
          isLoading={journal.isLoading}
          isError={journal.isError}
          onRetry={() => void journal.refetch()}
        />
        <TrialBalanceCard
          debit={journal.data?.trialBalance.debit ?? 0}
          credit={journal.data?.trialBalance.credit ?? 0}
          balanced={journal.data?.trialBalance.balanced ?? true}
          isLoading={journal.isLoading}
          isError={journal.isError}
          onRetry={() => void journal.refetch()}
        />
        <BalanceSheetSnapshot
          assets={journal.data?.balanceSheet.assets ?? 0}
          liabilities={journal.data?.balanceSheet.liabilities ?? 0}
          equity={journal.data?.balanceSheet.equity ?? 0}
          isLoading={journal.isLoading}
          isError={journal.isError}
          onRetry={() => void journal.refetch()}
        />
      </div>

      {/* Row 5 — payroll + alerts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PayrollSummaryCard
          payroll={payrollAlerts.data?.payroll}
          isLoading={payrollAlerts.isLoading}
          isError={payrollAlerts.isError}
          onRetry={() => void payrollAlerts.refetch()}
        />
        <AlertsPanel
          data={payrollAlerts.data}
          isLoading={payrollAlerts.isLoading}
          isError={payrollAlerts.isError}
          onRetry={() => void payrollAlerts.refetch()}
        />
      </div>
    </div>
  );
}
