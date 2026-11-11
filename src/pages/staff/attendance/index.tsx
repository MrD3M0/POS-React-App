import { useState, type ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getOwnStaff } from "../profile/edit/service/service";
import {
  listMyAttendance,
  type T_EMPLOYEE_ATTENDANCE,
} from "./service/service";

const LIMIT = 30;

export default function StaffAttendancePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const staffQuery = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: getOwnStaff,
  });
  const staff = staffQuery.data?.data as
    { employeeId?: string; employee?: { id?: string } } | undefined;
  const employeeId = staff?.employeeId ?? staff?.employee?.id;

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_ATTENDANCE, employeeId, page, search],
    queryFn: () => listMyAttendance({ page, limit: LIMIT, search, employeeId }),
    // Wait for the profile lookup to settle so we can filter by employeeId
    // when available; if it fails, fall back to listing all records.
    enabled: staffQuery.isSuccess || staffQuery.isError,
  });

  if (staffQuery.isLoading || query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_EMPLOYEE_ATTENDANCE[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_EMPLOYEE_ATTENDANCE>[] = [
    { key: "dateBs", headName: "Date (BS)", minWidth: 160 },
    {
      key: "status",
      headName: "Status",
      minWidth: 140,
      render: (r) => <Badge variant={mapStatus(r.status)}>{r.status}</Badge>,
    },
    {
      key: "leaveType",
      headName: "Leave Type",
      minWidth: 180,
      render: (r) => r.leaveType?.name ?? r.leaveType?.code ?? "—",
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="My Attendance"
        breadCrumbItems={[
          { title: "Staff", link: "/staff/attendance" },
          { title: "My Attendance", link: "/staff/attendance" },
        ]}
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search attendance..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No attendance records."
        renderRow={(r) =>
          ({
            dateBs: r.dateBs ?? "—",
            leaveType: r.leaveType?.name ?? r.leaveType?.code ?? "—",
          }) as Record<string, React.ReactNode>
        }
      />
    </div>
  );
}

function mapStatus(m: string): ComponentProps<typeof Badge>["variant"] {
  if (m === "PRESENT") return "default";
  if (m === "ABSENT") return "destructive";
  if (m === "LEAVE") return "secondary";
  if (m === "LATE" || m === "LATE DAY") return "warning";
  return "outline";
}
