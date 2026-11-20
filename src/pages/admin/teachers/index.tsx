import { useCallback, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import PageHeader, { type BreadcrumbEntry } from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import { ActiveStatusBadge } from "@/components/ui/status-badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";

import { getAllTeachers, type T_TEACHER } from "./service/service";

const LIMIT = 10;

type Props = {
  /** First breadcrumb entry; defaults to the admin-area root. */
  root?: BreadcrumbEntry;
};

/** Read-only list of teacher profiles (list display only — no CRUD). */
export default function TeachersListPage({
  root = { title: "Admin", link: "/admin" },
}: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHER_LIST, page, search],
    queryFn: () => getAllTeachers({ page, search, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_TEACHER[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const tableHeads: T_TableHead<T_TEACHER>[] = [
    {
      key: "employee.employeeCode",
      headName: "Employee Code",
      render: (t) => t.employee?.employeeCode ?? "—",
    },
    {
      key: "name",
      headName: "Name",
      render: (t) =>
        [t.employee?.firstName, t.employee?.lastName]
          .filter(Boolean)
          .join(" ") || "—",
    },
    {
      key: "designation",
      headName: "Designation",
      render: (t) => t.employee?.designation ?? "—",
    },
    {
      key: "email",
      headName: "Email",
      render: (t) => t.employee?.email ?? "—",
    },
    {
      key: "phone",
      headName: "Phone",
      render: (t) => t.employee?.phone ?? "—",
    },
    {
      key: "gender",
      headName: "Gender",
      render: (t) =>
        t.employee?.gender ? (
          <Badge variant="outline">{t.employee.gender}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      headName: "Status",
      render: (t) => <ActiveStatusBadge active={t.employee?.isActive ?? false} />,
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Teachers"
        description="Read-only list of employee-assigned teacher profiles."
        breadCrumbItems={[
          root,
          { title: "Teachers", link: `${root.link}/teachers` },
        ]}
      />
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onSearch={onSearch}
        emptyTitle="No teachers found."
        searchPlaceholder="Search by name or employee code..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
      />
    </div>
  );
}
