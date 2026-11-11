import { useState, type ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listEmployees,
  type T_EMPLOYEE,
} from "@/pages/admin/employees/service/service";
import {
  listPrincipalAttendance,
  type T_PRINCIPAL_ATTENDANCE,
} from "./service/service";

const LIMIT = 50;

function getEmployeeName(r: T_PRINCIPAL_ATTENDANCE): string {
  if (r.employeeName) return r.employeeName;
  if (r.employee) {
    return (
      [r.employee.firstName, r.employee.middleName, r.employee.lastName]
        .filter(Boolean)
        .join(" ") || "—"
    );
  }
  return r.employeeId ?? "—";
}

function getDesignation(r: T_PRINCIPAL_ATTENDANCE): string {
  return r.designation ?? r.employee?.designation ?? "—";
}

function getDate(r: T_PRINCIPAL_ATTENDANCE): string {
  return (
    (r as T_PRINCIPAL_ATTENDANCE & { dateBs?: string }).dateBs ?? r.date ?? "—"
  );
}

function getStatus(r: T_PRINCIPAL_ATTENDANCE): string {
  return r.status ?? r.mark ?? "—";
}

export default function PrincipalAttendancePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  // Default to all dates so existing attendance is visible immediately.
  const [dateBs, setDateBs] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const empQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ADMIN_EMPLOYEE_LIST,
      "principal-attendance-filter",
      "unlimited",
    ],
    queryFn: () => listEmployees({ page: 1, limit: 999 }),
  });

  const attQuery = useQuery({
    queryKey: [
      QUERY_KEYS.PRINCIPAL_ATTENDANCE,
      page,
      search,
      selectedEmpId,
      dateBs,
      statusFilter,
    ],
    queryFn: () =>
      listPrincipalAttendance({
        page,
        limit: LIMIT,
        search,
        employeeId: selectedEmpId,
        dateBs,
        status: statusFilter,
      }),
  });

  if (attQuery.isLoading) return <ScreenLoader />;
  if (attQuery.isError) return <AlertHandler variant="error" />;

  const employees: T_EMPLOYEE[] =
    empQuery.data?.data?.data ??
    (Array.isArray(empQuery.data?.data) ? empQuery.data.data : []);
  const employeeOptions = [
    { label: "All Employees", value: "" },
    ...employees.map((e) => {
      const name =
        [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") ||
        e.employeeCode ||
        e.id;
      return {
        label: name,
        value: e.id,
        searchValues: `${name} ${e.employeeCode ?? ""}`,
      };
    }),
  ];
  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Present", value: "PRESENT" },
    { label: "Absent", value: "ABSENT" },
    { label: "Leave", value: "LEAVE" },
    { label: "Late", value: "LATE" },
  ];

  const rawData = attQuery.data;
  const rawRows: T_PRINCIPAL_ATTENDANCE[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.data)
      ? rawData.data.data
      : [];

  const total: number = rawData?.data?.pagination?.total ?? rawRows.length;

  const rows = rawRows.filter((r) => {
    if (selectedEmpId) {
      const id = r.employeeId ?? r.employee?.id ?? "";
      if (id && id !== selectedEmpId) return false;
    }
    if (dateBs) {
      const d =
        r.date ??
        (r as T_PRINCIPAL_ATTENDANCE & { dateBs?: string }).dateBs ??
        "";
      if (d && !String(d).startsWith(dateBs)) return false;
    }
    if (statusFilter !== "ALL") {
      const s = r.status ?? r.mark ?? "";
      if (s !== statusFilter) return false;
    }
    return true;
  });

  const head: T_TableHead<T_PRINCIPAL_ATTENDANCE>[] = [
    {
      key: "employeeName",
      headName: "Employee",
      minWidth: 240,
      render: (r) => getEmployeeName(r),
    },
    {
      key: "designation",
      headName: "Designation",
      minWidth: 180,
      render: (r) => getDesignation(r),
    },
    { key: "date", headName: "Date", minWidth: 180, render: (r) => getDate(r) },
    {
      key: "status",
      headName: "Status",
      minWidth: 160,
      render: (r) => {
        const s = getStatus(r);
        return <Badge variant={mapStatus(s)}>{s}</Badge>;
      },
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Employee Attendance"
        breadCrumbItems={[
          { title: "Principal", link: "/principal" },
          { title: "Employee Attendance", link: "/principal/attendance" },
        ]}
      />
      <div className="mb-4 flex w-full max-w-5xl flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <SelectCommand
            value={selectedEmpId}
            onChange={(v) => {
              setSelectedEmpId(v ?? "");
              setPage(1);
            }}
            options={employeeOptions}
            placeholder={
              empQuery.isLoading ? "Loading employees..." : "All Employees"
            }
            searchPlaceholder="Search employees..."
            loading={empQuery.isLoading}
          />
        </div>
        <div className="min-w-[220px]">
          <BsDatePicker
            value={dateBs}
            valueFormat="bs"
            lang="en"
            placeholder="Filter by date (BS)"
            onChange={(v) => {
              setDateBs(typeof v === "string" ? v : "");
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[180px]">
          <SelectCommand
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v || "ALL");
              setPage(1);
            }}
            options={statusOptions}
            placeholder="All Statuses"
            hideSearch
          />
        </div>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search attendance..."
        emptyTitle="No attendance records."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderRow={(r) =>
          ({
            employeeName: getEmployeeName(r),
            designation: getDesignation(r),
            date: getDate(r),
            status: r.status ?? r.mark ?? "—",
          }) as Record<string, React.ReactNode>
        }
      />
    </div>
  );
}

function mapStatus(s: string): ComponentProps<typeof Badge>["variant"] {
  if (s === "PRESENT") return "default";
  if (s === "ABSENT") return "destructive";
  if (s === "LATE" || s === "LATE DAY") return "warning";
  if (s === "LEAVE") return "secondary";
  return "outline";
}
