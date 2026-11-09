import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listMyClasses, type T_MY_CLASS } from "./service/service";

const LIMIT = 20;

function getBatchName(r: T_MY_CLASS): string {
  if (r.batchName) return r.batchName;
  if (r.batch?.name) return r.batch.name;
  if (r.batchTermSubject?.batchTerm?.batch?.name) return r.batchTermSubject.batchTerm.batch.name;
  return "—";
}
function getSubject(r: T_MY_CLASS): string {
  if (r.subjectCode) return r.subjectCode;
  if (r.subjectName) return r.subjectName;
  if (r.subject?.code) return r.subject.code;
  if (r.subject?.name) return r.subject.name;
  if (r.batchTermSubject?.subject?.code) return r.batchTermSubject.subject.code;
  if (r.batchTermSubject?.subject?.name) return r.batchTermSubject.subject.name;
  return "—";
}
function getStudents(r: T_MY_CLASS): number | string {
  if (typeof r.studentCount === "number") return r.studentCount;
  const c = (r as { studentCount?: unknown }).studentCount;
  return typeof c === "number" || typeof c === "string" ? c : "—";
}

export default function TeacherMyClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES, page, search],
    queryFn: () => listMyClasses({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const raw = query.data as unknown as { data?: { data?: T_MY_CLASS[]; pagination?: { total?: number } }; dataData?: unknown };
  const rows: T_MY_CLASS[] = Array.isArray((raw as { data?: unknown })?.data)
    ? ((raw as { data?: T_MY_CLASS[] }).data ?? [])
    : Array.isArray(raw?.data?.data)
      ? raw.data.data
      : [];
  const total: number = raw?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_MY_CLASS>[] = [
    { key: "batchName", headName: "Batch", minWidth: 220, render: (r) => getBatchName(r) },
    { key: "subjectCode", headName: "Subject", minWidth: 200, render: (r) => getSubject(r) },
    { key: "className", headName: "Class", minWidth: 240, render: (r) => r.className ?? "—" },
    { key: "studentCount", headName: "Students", minWidth: 120, render: (r) => getStudents(r) },
  ];

  return (
    <div className="p-5">
      <PageHeader title="My Classes" breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "My Classes", link: "/teacher/my-classes" }]} />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search classes..."
        emptyTitle="No classes assigned to you."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderRow={(r) => ({
          batchName: getBatchName(r),
          subjectCode: getSubject(r),
          className: r.className ?? "—",
          studentCount: getStudents(r),
        } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
