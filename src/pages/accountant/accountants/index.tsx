import { useCallback, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import PageHeader, { type BreadcrumbEntry } from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import { ActiveStatusBadge } from "@/components/ui/status-badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";

import { getAllAccountants, type T_ACCOUNTANT } from "./service/service";

const LIMIT = 10;

type Props = {
  /** First breadcrumb entry; defaults to the accountant-area root. */
  root?: BreadcrumbEntry;
};

/** Read-only list of accountant profiles (list display only — no CRUD). */
export default function AccountantListPage({
  root = { title: "Accountant", link: "/accountant" },
}: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_LIST, page, search],
    queryFn: () => getAllAccountants({ page, search, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_ACCOUNTANT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const tableHeads: T_TableHead<T_ACCOUNTANT>[] = [
    {
      key: "employee.employeeCode",
      headName: "Employee Code",
      render: (acc) => acc.employee?.employeeCode ?? "—",
    },
    {
      key: "name",
      headName: "Name",
      render: (acc) =>
        [acc.employee?.firstName, acc.employee?.lastName]
          .filter(Boolean)
          .join(" ") || "—",
    },
    {
      key: "designation",
      headName: "Designation",
      render: (acc) => acc.employee?.designation ?? "—",
    },
    {
      key: "email",
      headName: "Email",
      render: (acc) => acc.employee?.email ?? "—",
    },
    {
      key: "phone",
      headName: "Phone",
      render: (acc) => acc.employee?.phone ?? "—",
    },
    {
      key: "gender",
      headName: "Gender",
      render: (acc) =>
        acc.employee?.gender ? (
          <Badge variant="outline">{acc.employee.gender}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      headName: "Status",
      render: (acc) => <ActiveStatusBadge active={acc.employee?.isActive ?? false} />,
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Accountants"
        description="Read-only list of employee-assigned accountant profiles."
        breadCrumbItems={[
          root,
          { title: "Accountants", link: `${root.link}/accountants` },
        ]}
      />
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onSearch={onSearch}
        emptyTitle="No accountants found."
        searchPlaceholder="Search by name or employee code..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
      />
    </div>
  );
}
