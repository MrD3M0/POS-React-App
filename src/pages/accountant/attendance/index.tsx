import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Button from "@/components/ui/button";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listEmployees } from "@/pages/accountant/service-utils";
import {
  listAttendance,
  listLeaveTypes,
  markAttendance,
  type T_ATT,
  type T_ATT_STATUS,
} from "./service/service";

const LIMIT = 50;

type T_StatusFilter = T_ATT_STATUS | "";

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Late", value: "LATE" },
  { label: "Leave", value: "LEAVE" },
];

function mapStatus(
  m: string,
): "default" | "destructive" | "warning" | "secondary" | "outline" {
  if (m === "PRESENT") return "default";
  if (m === "ABSENT") return "destructive";
  if (m === "LATE" || m === "LATE DAY") return "warning";
  if (m === "LEAVE") return "secondary";
  return "outline";
}

function employeeName(row: T_ATT): string {
  const e = row.employee;
  if (!e) return row.employeeId || "—";
  return (
    [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") ||
    e.employeeCode ||
    e.id ||
    "—"
  );
}

function statusLabel(value: string): string {
  return value === "LATE" ? "LATE" : value;
}

export default function AccountantAttendancePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [empId, setEmpId] = useState("");
  const [date, setDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<T_StatusFilter>("");
  const [markStatus, setMarkStatus] = useState<T_ATT_STATUS | "">("");
  const [leaveTypeId, setLeaveTypeId] = useState("");

  const employeesQuery = useQuery({
    queryKey: ["accountant-employees", "attendance-filter", "unlimited"],
    queryFn: () => listEmployees({ page: 1, limit: -1 }),
  });

  const leaveTypesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP_LEAVE, "attendance-mark"],
    queryFn: listLeaveTypes,
    enabled: markStatus === "LEAVE",
  });

  const query = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNTANT_ATTENDANCE,
      page,
      empId,
      date,
      statusFilter,
    ],
    queryFn: () =>
      listAttendance({
        page,
        limit: LIMIT,
        employeeId: empId,
        dateBs: date,
        status: statusFilter,
      }),
  });

  const markMut = useMutation({
    mutationFn: () => {
      if (!empId || !date || !markStatus)
        throw new Error("Select employee, date and status");
      if (markStatus === "LEAVE" && !leaveTypeId)
        throw new Error("Select a leave type for leave");
      return markAttendance({
        employeeId: empId,
        dateBs: date,
        status: markStatus,
        leaveTypeId: leaveTypeId || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Attendance saved.");
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNTANT_ATTENDANCE],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STAFF_ATTENDANCE],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save attendance.",
      );
    },
  });

  const employeeRows = employeesQuery.data?.data?.data ?? [];
  const employeeOptions = (Array.isArray(employeeRows) ? employeeRows : []).map(
    (e) => {
      const name =
        [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") ||
        e.employeeCode ||
        e.id;
      return {
        label: `${name}${e.employeeCode ? ` (${e.employeeCode})` : ""}`,
        value: e.id,
        searchValues: `${name} ${e.employeeCode ?? ""} ${e.designation ?? ""}`,
      };
    },
  );

  const leaveTypeOptions = (leaveTypesQuery.data ?? []).map((t) => ({
    label: `${t.name}${t.code ? ` (${t.code})` : ""}`,
    value: t.id,
    searchValues: `${t.name} ${t.code ?? ""}`,
  }));

  if (query.isError) return <AlertHandler variant="error" />;

  const rows = query.data?.rows ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="p-5">
      <PageHeader
        title="Employee Attendance"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Employee Attendance", link: "/accountant/attendance" },
        ]}
      />
      <div className="mb-4 flex w-full max-w-6xl flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <SelectCommand
            value={empId}
            onChange={(v) => {
              setEmpId(v ?? "");
              setPage(1);
            }}
            options={employeeOptions}
            placeholder={
              employeesQuery.isLoading
                ? "Loading employees..."
                : "Select employee..."
            }
            searchPlaceholder="Search employees..."
            loading={employeesQuery.isLoading}
          />
        </div>
        <div className="min-w-[220px]">
          <BsDatePicker
            value={date}
            valueFormat="bs"
            lang="en"
            placeholder="Filter by date (BS)"
            onChange={(v) => {
              setDate(typeof v === "string" ? v : "");
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[180px]">
          <SelectCommand
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter((v ?? "") as T_StatusFilter);
              setPage(1);
            }}
            options={statusOptions}
            placeholder="All Statuses"
            hideSearch
          />
        </div>
        <div className="min-w-[180px]">
          <SelectCommand
            value={markStatus}
            onChange={(v) => {
              setMarkStatus((v ?? "") as T_ATT_STATUS | "");
              setLeaveTypeId("");
            }}
            options={statusOptions.filter((option) => option.value !== "")}
            placeholder="Mark status..."
            hideSearch
          />
        </div>
        {markStatus === "LEAVE" ? (
          <div className="min-w-[200px]">
            <SelectCommand
              value={leaveTypeId}
              onChange={(v) => setLeaveTypeId(v ?? "")}
              options={leaveTypeOptions}
              placeholder={
                leaveTypesQuery.isLoading
                  ? "Loading leave types..."
                  : "Leave type..."
              }
              searchPlaceholder="Search leave types..."
              loading={leaveTypesQuery.isLoading}
            />
          </div>
        ) : null}
        <Button
          variant="primary"
          size="sm"
          loading={markMut.isPending}
          disabled={
            !empId ||
            !date ||
            !markStatus ||
            (markStatus === "LEAVE" && !leaveTypeId) ||
            markMut.isPending
          }
          onClick={() => markMut.mutate()}
        >
          Save
        </Button>
      </div>

      {query.isLoading ? (
        <ScreenLoader />
      ) : (
        <GenericTable
          tableHeads={[
            {
              key: "employeeName",
              headName: "Employee",
              minWidth: 240,
              render: (a: T_ATT) => employeeName(a),
            },
            {
              key: "designation",
              headName: "Designation",
              minWidth: 180,
              render: (a: T_ATT) => a.employee?.designation ?? "—",
            },
            {
              key: "dateBs",
              headName: "Date (BS)",
              minWidth: 160,
              render: (a: T_ATT) => a.dateBs ?? "—",
            },
            {
              key: "status",
              headName: "Status",
              minWidth: 160,
              render: (a: T_ATT) => (
                <Badge variant={mapStatus(a.status)}>
                  {statusLabel(a.status)}
                </Badge>
              ),
            },
          ]}
          data={rows}
          emptyTitle="No attendance records."
          searchPlaceholder="Search attendance..."
          pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
          renderRow={(a) =>
            ({
              employeeName: employeeName(a),
              designation: a.employee?.designation ?? "—",
              dateBs: a.dateBs ?? "—",
              status: statusLabel(a.status),
            }) as Record<string, React.ReactNode>
          }
        />
      )}
    </div>
  );
}
