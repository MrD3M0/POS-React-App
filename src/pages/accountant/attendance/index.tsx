import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 50;

export default function AccountantAttendancePage() {
  const [empId, setEmpId] = useState("");
  const [date, setDate] = useState("2026-01-01");
  const [markFilter, setMarkFilter] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_ATTENDANCE, empId, date],
    queryFn: () => ({ attUrl: "/accountant/attendance", employeeId: empId, date }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_ATT[] = query.data?.data?.data ?? [];

  const markMut = useMutation({
    mutationFn: async () => {
      await fetch(`/accountant/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` },
        body: JSON.stringify({ employeeId: empId, date, mark: markFilter || undefined }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_ATTENDANCE] }),
  });

  const head: T_TableHead<T_ATT>[] = [
    { key: "employeeName", headName: "Employee", minWidth: 240 },
    { key: "designation", headName: "Designation", minWidth: 180 },
    { key: "date", headName: "Date", minWidth: 160 },
    { key: "status", headName: "Status", minWidth: 160, render: (a) => <Badge variant={mapStatus(a.mark)}>{a.mark}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Employee Attendance"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Employee Attendance", link: "/accountant/attendance" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Select employee..." value={empId} onChange={(e) => { setEmpId(e.target.value); setMarkFilter(""); }} />
        <select className="rounded border px-3 py-1 text-sm bg-background" value={date} onChange={(e) => setDate(e.target.value)}>
          {[...Array(30)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0"); return <option key={i} value={`${y}-${m}-${day}`}>—{y}.{m}.{day}</option>; })}
        </select>
        <select className="rounded border px-3 py-1 text-sm bg-background" value={markFilter} onChange={(e) => setMarkFilter(e.target.value)}>
          <option value="">All</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF DAY">Half Day</option>
          <option value="LEAVE">Leave</option>
        </select>
        <Button variant="primary" size="sm" disabled={!empId || markMut.isPending} onClick={async () => { await markMut.mutateAsync(); toast.success("Attendance saved"); }}>
          {markMut.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        emptyTitle="No attendance records."
        pagination={{ page: 1, limit: LIMIT, total: rows.length, onPageChange: () => {} }}
        searchPlaceholder="Select employee and date..."
        renderRow={(r) => ({ employeeName: r.employeeName, designation: r.designation ?? "—", status: mapStatus(r.mark) } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}

function mapStatus(m: string): Badge["variant"] {
  if (m === "PRESENT") return "default";
  if (m === "ABSENT") return "destructive";
  if (m === "HALF DAY") return "warning";
  if (m === "LEAVE") return "secondary";
  return "outline";
}

type T_ATT = {
  employeeId: string;
  employeeName: string;
  designation?: string;
  date: string;
  mark: "PRESENT" | "ABSENT" | "HALF DAY" | "LEAVE";
};
