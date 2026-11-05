import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import QUERY_KEYS from "@/lib/query-keys";
import { listAttendance, markAttendance } from "./service/service";
import { useState as useReactState } from "react";

const LIMIT = 50;

export default function AccountantAttendancePage() {
  const [empId, setEmpId] = useReactState("");
  const [date, setDate] = useReactState<string | null>(null);
  const [markFilter, setMarkFilter] = useReactState<string | undefined>("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_ATTENDANCE, empId, date],
    queryFn: () =>
      listAttendance({ employeeId: empId || "", date: date || "" }),
  });

  const markMut = useMutation({
    mutationFn: async () => {
      if (!empId || !date || !markFilter) return;
      await markAttendance({
        employeeId: empId,
        date: date!,
        mark: markFilter as "PRESENT" | "ABSENT" | "HALF DAY" | "LEAVE",
      });
    },
    onSuccess: () => toast.success("Attendance saved"),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_ATT[] = query.data ?? [];

  const mapStatus = (
    m: string,
  ): "default" | "destructive" | "warning" | "secondary" | "outline" => {
    if (m === "PRESENT") return "default";
    if (m === "ABSENT") return "destructive";
    if (m === "HALF DAY") return "warning";
    if (m === "LEAVE") return "secondary";
    return "outline";
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Employee Attendance"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Employee Attendance", link: "/accountant/attendance" },
        ]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input
          placeholder="Select employee..."
          value={empId}
          onChange={(e) => {
            setEmpId(e.target.value);
            setMarkFilter("");
          }}
        />
        <select
          className="rounded border px-3 py-1 text-sm bg-background"
          disabled={!empId}
          value={date || ""}
          onChange={(e) => setDate(e.target.value as string)}
        >
          {[...Array(30)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const y = d.getFullYear(),
              m = String(d.getMonth() + 1).padStart(2, "0"),
              day = String(d.getDate()).padStart(2, "0");
            return (
              <option key={i} value={`${y}-${m}-${day}`}>
                —{y}.{m}.{day}
              </option>
            );
          })}
        </select>
        <select
          className="rounded border px-3 py-1 text-sm bg-background"
          value={markFilter || ""}
          onChange={(e) => setMarkFilter(e.target.value as string)}
        >
          <option value="">All</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF DAY">Half Day</option>
          <option value="LEAVE">Leave</option>
        </select>
      </div>

      <GenericTable
        tableHeads={[
          { key: "employeeName", headName: "Employee", minWidth: 240 },
          { key: "designation", headName: "Designation", minWidth: 180 },
          { key: "date", headName: "Date", minWidth: 160 },
          {
            key: "status",
            headName: "Status",
            minWidth: 160,
            render: (a: T_ATT) => (
              <Badge variant={mapStatus(a.mark)}>{a.mark}</Badge>
            ),
          },
        ]}
        data={rows}
        emptyTitle="No attendance records."
        pagination={{
          page: 1,
          limit: LIMIT,
          total: rows.length,
          onPageChange: () => {},
        }}
        searchPlaceholder="Select employee and date..."
        renderRow={(r: T_ATT) =>
          ({
            employeeName: r.employeeName,
            designation: r.designation ?? "—",
            status: mapStatus(r.mark),
          }) as Record<string, React.ReactNode>
        }
      />

      <Button
        variant="primary"
        size="sm"
        disabled={!empId || !date || !markFilter || markMut.isPending}
        onClick={async () => {
          await markMut.mutateAsync();
        }}
      >
        {markMut.isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

type T_ATT = {
  employeeId: string;
  employeeName: string;
  designation?: string;
  date: string;
  mark: "PRESENT" | "ABSENT" | "HALF DAY" | "LEAVE";
};
