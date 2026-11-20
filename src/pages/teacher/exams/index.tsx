import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PenSquare } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listExams, type T_EXAM } from "./service/service";

const LIMIT = 20;

function toRows(raw: unknown): { rows: T_EXAM[]; total: number } {
  const r = raw as { data?: T_EXAM[] | { data?: T_EXAM[]; pagination?: { total?: number } } };
  const rows: T_EXAM[] = Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.data) ? r.data.data : [];
  const total: number = Number(!Array.isArray(r?.data) ? r?.data?.pagination?.total : undefined) || rows.length;
  return { rows, total };
}

export default function TeacherExamsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, page, search],
    queryFn: () => listExams({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const { rows, total } = toRows(query.data);

  const head: T_TableHead<T_EXAM>[] = [
    { key: "name", headName: "Exam Name", minWidth: 240, render: (r) => String(r.name ?? (r as Record<string, unknown>).examName ?? "—") },
    {
      key: "examType",
      headName: "Exam Type",
      minWidth: 160,
      render: (r) => String(r.examType?.name ?? "—"),
    },
    {
      key: "batchTerm",
      headName: "Batch Term",
      minWidth: 200,
      render: (r) => {
        const t = r.batchTerm;
        if (!t) return "—";
        return [t.name, t.termNumber != null ? `Term ${t.termNumber}` : null].filter(Boolean).join(" — ") || "—";
      },
    },
    { key: "startDateBs", headName: "Start (BS)", minWidth: 130, render: (r) => String(r.startDateBs ?? "—") },
    { key: "endDateBs", headName: "End (BS)", minWidth: 130, render: (r) => String(r.endDateBs ?? "—") },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Exams"
        breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Exams", link: "/teacher/exams" }]}
        createPage="/teacher/exams/create"
        createPageTitle="Create Exam"
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search exams..."
        emptyTitle="No exams yet."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderActions={(r) => (
          <DropdownMenuItem
            onClick={() => navigate(`/teacher/exams/edit/${r.id}`)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
          >
            <PenSquare className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}
      />
    </div>
  );
}
