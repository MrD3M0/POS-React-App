import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 20;

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_STUDENTS, search],
    queryFn: () => ({ studentsUrl: "/teacher/students" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_STUDENT_VIEW[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader title="My Students" breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Students", link: "/teacher/students" }]} createPage="/teacher/students/create" />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); }} />
        <Button variant="outline" size="sm" onClick={async () => { await fetch(`/teacher/students/create`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` } }); toast.success("Student added (PENDING)"); qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_STUDENTS] }); }}>Add Student</Button>
      </div>

      <GenericTableHelper status={rows} search={search} />
    </div>
  );
}

function GenericTableHelper({ status, search }: { status: T_STUDENT_VIEW[]; search: string }) {
  const [head] = useState([
    { key: "universityRegNo", headName: "Reg No", minWidth: 160 },
    { key: "firstName", headName: "First Name", minWidth: 220 },
    { key: "lastName", headName: "Last Name", minWidth: 200 },
    { key: "approvalStatus", headName: "Approval", minWidth: 160, render: (s: any) => <Badge variant={s.approvalStatus === "APPROVED" ? "success" : s.approvalStatus === "REJECTED" ? "destructive" : "warning"}>{s.approvalStatus}</Badge> },
    { key: "rejectionReason", headName: "Rejection", minWidth: 200 },
  ]);
  const [dataRows] = useState(status);
  const [pag, setPag] = useState({ page: 1, limit: LIMIT, total: status.length, onPageChange: () => {} });

  return <GenericTable head={head} data={dataRows} pagination={pag} searchPlaceholder={search ? `Search (${search.slice(0, 10)}...)` : "Search students..."} />;
}

type T_STUDENT_VIEW = {
  id: string;
  universityRegNo: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
};
