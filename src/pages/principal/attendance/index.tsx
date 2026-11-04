import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";
import { listEmployees } from "@/pages/admin/employees/service/service";
import type { T_EMPLOYEE } from "@/pages/admin/employees/service/service";

const LIMIT = 50;

export default function PrincipalAttendancePage() {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [currentDate, setCurrentDate] = useState("2026-01-01"); // default today (BS)
  const [statusFilter, setStatusFilter] = useState("ALL");
  const qc = useQueryClient();

  const empQuery = useQuery({ queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST], queryFn: () => listEmployees({ page: 1, limit: 200 }) });

  const attQuery = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_ATTENDANCE, selectedEmpId, currentDate],
    queryFn: () => ({ principalAttendanceUrl: "/principal/attendance", employeeId: selectedEmpId, date: currentDate }),
  });

  if (attQuery.isLoading || empQuery.isLoading) return <ScreenLoader />;
  if (attQuery.isError) return <AlertHandler variant="error" />;

  // Fetch employees list for the dropdown
  const employees: T_EMPLOYEE[] = empQuery.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader
        title="Employee Attendance"
        breadCrumbItems={[{ title: "Principal", link: "/principal" }, { title: "Employee Attendance", link: "/principal/attendance" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Select employee..." value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} />
        <select
          className="rounded border px-3 py-1 text-sm bg-background"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
        >
          {[...Array(30)].map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - i);
            const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
            return <option key={i} value={`${y}-${m}-${day}`}>—{y}.{m}.{day}</option>;
          })}
        </select>
        <select className="rounded border px-3 py-1 text-sm bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LEAVE">Leave</option>
          <option value="HALF DAY">Half Day</option>
        </select>
      </div>

      <GenericTable
        tableHeads={[
          { key: "employeeName", headName: "Employee", minWidth: 240 },
          { key: "designation", headName: "Designation", minWidth: 180 },
          { key: "date", headName: "Date", minWidth: 180 },
          { key: "status", headName: "Status", minWidth: 160, render: (r: any) => <Badge variant={mapStatus(r.status)}>{r.status}</Badge> },
        ]}
        data={[]}
        emptyTitle="No attendance records."
        pagination={{ page: 1, limit: LIMIT, total: 0, onPageChange: () => {} }}
        searchPlaceholder="Select employee and date..."
        renderRow={() => ({ employeeName: "", designation: "", status: "" } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}

function mapStatus(s: string): Badge["variant"] {
  if (s === "PRESENT") return "default";
  if (s === "ABSENT") return "destructive";
  if (s === "HALF DAY") return "warning";
  if (s === "LEAVE") return "secondary";
  return "outline";
}
