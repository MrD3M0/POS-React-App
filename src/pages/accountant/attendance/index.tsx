import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { listAttendance, markAttendance } from "./service/service";

const LIMIT = 50;
type Mark = "PRESENT" | "ABSENT" | "HALF DAY" | "LEAVE";

type T_ATT = {
  employeeId: string;
  employeeName: string;
  designation?: string;
  date: string;
  mark: Mark;
};

function mapStatus(m: string): "default" | "destructive" | "warning" | "secondary" | "outline" {
  if (m === "PRESENT") return "default";
  if (m === "ABSENT") return "destructive";
  if (m === "HALF DAY") return "warning";
  if (m === "LEAVE") return "secondary";
  return "outline";
}

export default function AccountantAttendancePage() {
  const [empId, setEmpId] = useState("");
  const [date, setDate] = useState("");
  const [markFilter, setMarkFilter] = useState<Mark | "">("");

  const employeesQuery = useQuery({
    queryKey: ["accountant-employees", "attendance-filter", "unlimited"],
    queryFn: () => listEmployees({ page: 1, limit: 999 }),
  });

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_ATTENDANCE, empId, date],
    queryFn: () => listAttendance({ employeeId: empId || "", date: date || "" }),
    enabled: Boolean(empId && date),
  });

  const markMut = useMutation({
    mutationFn: async () => {
      if (!empId || !date || !markFilter) return;
      await markAttendance({ employeeId: empId, date, mark: markFilter });
    },
    onSuccess: () => {
      toast.success("Attendance saved.");
      query.refetch();
    },
    onError: () => toast.error("Failed to save attendance."),
  });

  const employeeOptions = (employeesQuery.data?.data?.data ?? []).map((e) => {
    const name = [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") || e.employeeCode || e.id;
    return { label: `${name}${e.employeeCode ? ` (${e.employeeCode})` : ""}`, value: e.id, searchValues: `${name} ${e.employeeCode ?? ""} ${e.designation ?? ""}` };
  });

  const markOptions = [
    { label: "Select mark...", value: "" },
    { label: "Present", value: "PRESENT" },
    { label: "Absent", value: "ABSENT" },
    { label: "Half Day", value: "HALF DAY" },
    { label: "Leave", value: "LEAVE" },
  ];

  if (query.isError) return <AlertHandler variant="error" />;

  const rows = (query.data ?? []) as T_ATT[];

  return (
    <div className="p-5">
      <PageHeader
        title="Employee Attendance"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Employee Attendance", link: "/accountant/attendance" },
        ]}
      />
      <div className="mb-4 flex w-full max-w-5xl flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <SelectCommand
            value={empId}
            onChange={(v) => { setEmpId(v ?? ""); setMarkFilter(""); }}
            options={employeeOptions}
            placeholder={employeesQuery.isLoading ? "Loading employees..." : "Select employee..."}
            searchPlaceholder="Search employees..."
            loading={employeesQuery.isLoading}
            isClearable
          />
        </div>
        <div className="min-w-[220px]">
          <BsDatePicker
            value={date}
            valueFormat="bs"
            lang="en"
            placeholder="Select date (BS)"
            onChange={(v) => setDate(typeof v === "string" ? v : "")}
          />
        </div>
        <div className="min-w-[180px]">
          <SelectCommand
            value={markFilter}
            onChange={(v) => setMarkFilter((v ?? "") as Mark | "")}
            options={markOptions}
            placeholder="Select mark..."
            hideSearch
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          loading={markMut.isPending}
          disabled={!empId || !date || !markFilter || markMut.isPending}
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
            { key: "employeeName", headName: "Employee", minWidth: 240, render: (a: T_ATT) => a.employeeName ?? "—" },
            { key: "designation", headName: "Designation", minWidth: 180, render: (a: T_ATT) => a.designation ?? "—" },
            { key: "date", headName: "Date", minWidth: 160, render: (a: T_ATT) => a.date ?? "—" },
            { key: "status", headName: "Status", minWidth: 160, render: (a: T_ATT) => <Badge variant={mapStatus(a.mark)}>{a.mark}</Badge> },
          ]}
          data={rows}
          emptyTitle={empId && date ? "No attendance records." : "Select employee and date (BS) to view attendance."}
          pagination={{ page: 1, limit: LIMIT, total: rows.length, onPageChange: () => {} }}
        />
      )}
    </div>
  );
}
