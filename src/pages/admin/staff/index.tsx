import { useCallback, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import PageHeader, { type BreadcrumbEntry } from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";

import { getAllStaff, type T_STAFF_PROFILE } from "./service/service";

const LIMIT = 10;

type Props = {
  /** First breadcrumb entry; defaults to the admin-area root. */
  root?: BreadcrumbEntry;
};

/** Read-only list of staff profiles (list display only — no CRUD). */
export default function StaffListPage({
  root = { title: "Admin", link: "/admin" },
}: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STAFF_LIST, page, search],
    queryFn: () => getAllStaff({ page, search, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_STAFF_PROFILE[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const tableHeads: T_TableHead<T_STAFF_PROFILE>[] = [
    {
      key: "employee.employeeCode",
      headName: "Employee Code",
      render: (s) => s.employee?.employeeCode ?? "—",
    },
    {
      key: "name",
      headName: "Name",
      render: (s) =>
        [s.employee?.firstName, s.employee?.lastName]
          .filter(Boolean)
          .join(" ") || "—",
    },
    {
      key: "designation",
      headName: "Designation",
      render: (s) => s.employee?.designation ?? "—",
    },
    {
      key: "email",
      headName: "Email",
      render: (s) => s.employee?.email ?? "—",
    },
    {
      key: "phone",
      headName: "Phone",
      render: (s) => s.employee?.phone ?? "—",
    },
    {
      key: "gender",
      headName: "Gender",
      render: (s) =>
        s.employee?.gender ? (
          <Badge variant="outline">{s.employee.gender}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      headName: "Status",
      render: (s) => (
        <Badge variant={s.employee?.isActive ? "default" : "destructive"}>
          {s.employee?.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Staff"
        description="Read-only list of employee-assigned staff profiles."
        breadCrumbItems={[
          root,
          { title: "Staff", link: `${root.link}/staff` },
        ]}
      />
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onSearch={onSearch}
        emptyTitle="No staff found."
        searchPlaceholder="Search by name or employee code..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
      />
    </div>
  );
}
