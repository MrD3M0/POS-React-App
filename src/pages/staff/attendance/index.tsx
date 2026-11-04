import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const LIMIT = 30;

export default function StaffAttendancePage() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_ATTENDANCE, search],
    queryFn: () => ({ attendanceUrl: "/staff/attendance" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_ATTMARK[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader title="My Attendance" breadCrumbItems={[{ title: "Staff", link: "/staff" }, { title: "My Attendance", link: "/staff/attendance" }]} />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Filter by date..." onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.id ?? i} className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">{r.studentName ?? r.employeeName}</span>
            <Badge variant={mapStatus(r.mark)}>{r.mark}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function mapStatus(m: string): Badge["variant"] {
  if (m === "PRESENT") return "default";
  if (m === "ABSENT") return "destructive";
  if (m === "LEAVE") return "secondary";
  if (m === "HALF DAY") return "warning";
  return "outline";
}

import { useState } from "react";
type T_ATTMARK = { id?: string; studentName?: string; employeeName?: string; mark: string; date?: string };
void useState;
