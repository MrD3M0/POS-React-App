import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import GenericTable from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listInstallments, type T_Installment } from "./service/service";

const LIMIT = 20;

function rowsFromList(data: unknown): { rows: unknown[]; total: number } {
  const raw = data as { data?: unknown; pagination?: { total?: number } };
  if (Array.isArray(raw?.data)) return { rows: raw.data, total: raw?.pagination?.total ?? raw.data.length };
  const nested = raw?.data as { data?: unknown[]; pagination?: { total?: number } } | undefined;
  if (nested && Array.isArray(nested.data)) return { rows: nested.data, total: nested?.pagination?.total ?? nested.data.length };
  return { rows: [], total: 0 };
}

/** Installments — the payment plan of a fee item. */
export default function AccountantInstallmentsPage() {
  const [page, setPage] = useState(1);
  const [itemId, setItemId] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_INSTALLMENTS, itemId, page],
    queryFn: () =>
      listInstallments({
        page,
        limit: LIMIT,
        ...(itemId ? { studentFeeItemId: itemId } : {}),
      }),
  });

  const installments = useMemo(
    () => rowsFromList(query.data).rows as T_Installment[],
    [query.data],
  );

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Installments"
        description="The payment plan of a fee item, with the BS date each part falls due."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/dashboard" },
          { title: "Installments", link: "/accountant/billing/installments" },
        ]}
      />

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Filter by student fee item ID..."
          value={itemId}
          onChange={(event) => {
            setItemId(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <GenericTable
        tableHeads={[
          {
            key: "item",
            headName: "Fee Item",
            minWidth: 220,
            render: (it: T_Installment) =>
              it.studentFeeItem?.feeHead?.name ??
              it.studentFeeItem?.description ??
              it.studentFeeItemId,
          },
          {
            key: "no",
            headName: "No.",
            minWidth: 80,
            render: (it: T_Installment) => String(it.installmentNo),
          },
          {
            key: "due",
            headName: "Due (BS)",
            minWidth: 120,
            render: (it: T_Installment) => it.dueDateBs,
          },
          {
            key: "amount",
            headName: "Amount",
            minWidth: 120,
            render: (it: T_Installment) => `Rs. ${Number(it.amount).toFixed(2)}`,
          },
        ]}
        data={installments}
        emptyTitle="No installment."
        pagination={{
          page,
          limit: LIMIT,
          total: rowsFromList(query.data).total,
          onPageChange: setPage,
        }}
        searchPlaceholder="Search installments..."
      />
    </div>
  );
}
