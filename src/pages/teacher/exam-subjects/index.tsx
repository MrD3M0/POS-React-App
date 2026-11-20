import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PenSquare } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listExams, type T_EXAM } from "../exams/service/service";
import {
  listExamSubjects,
  updateExamSubject,
  deleteExamSubject,
  listBatchTermSubjects,
  type T_EXAM_SUBJECT,
  type T_BATCH_TERM_SUBJECT,
} from "./service/service";
import EditExamSubjectForm from "./components/edit-exam-subject-form";
import {
  classNameLabel,
  examSubjectLabel,
  subjectLabel,
} from "@/lib/teaching-assignment-label";

const LIMIT = 20;

function examName(r: T_EXAM_SUBJECT): string {
  return r.exam?.name ?? (r.examName as string | undefined) ?? "—";
}
function subjectCode(r: T_EXAM_SUBJECT): string {
  const label = examSubjectLabel(r);
  if (label) return label;
  const fallback = subjectLabel(r.batchTermSubject?.subject);
  return fallback || "—";
}
function toRows(raw: unknown): { rows: T_EXAM_SUBJECT[]; total: number } {
  const r = raw as {
    data?:
      | T_EXAM_SUBJECT[]
      | { data?: T_EXAM_SUBJECT[]; pagination?: { total?: number } };
  };
  const rows: T_EXAM_SUBJECT[] = Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
  const total: number =
    Number(!Array.isArray(r?.data) ? r?.data?.pagination?.total : undefined) ||
    rows.length;
  return { rows, total };
}
function toBtsRows(raw: unknown): T_BATCH_TERM_SUBJECT[] {
  const r = raw as {
    data?: T_BATCH_TERM_SUBJECT[] | { data?: T_BATCH_TERM_SUBJECT[] };
  };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}
function toExamRows(raw: unknown): T_EXAM[] {
  const r = raw as { data?: T_EXAM[] | { data?: T_EXAM[] } };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}

export default function TeacherExamSubjectsPage() {
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editRecord, setEditRecord] = useState<T_EXAM_SUBJECT | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS, page, search],
    queryFn: () => listExamSubjects({ page, limit: LIMIT, search }),
  });
  const examsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "picker", "unlimited"],
    queryFn: () => listExams({ page: 1, limit: -1 }),
  });
  const btsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS, "bts-picker", "unlimited"],
    queryFn: () => listBatchTermSubjects({ page: 1, limit: -1 }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateExamSubject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS] });
      toast.success("Exam subject updated");
      setMode("list");
      setEditRecord(null);
    },
    onError: () => toast.error("Failed to update exam subject"),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const { rows, total } = toRows(query.data);
  const exams = toExamRows(examsQuery.data);
  const btsList = toBtsRows(btsQuery.data);

  const head: T_TableHead<T_EXAM_SUBJECT>[] = [
    {
      key: "exam",
      headName: "Exam",
      minWidth: 220,
      render: (r) => examName(r),
    },
    {
      key: "subjectCode",
      headName: "Subject / Teacher",
      minWidth: 260,
      render: (r) => subjectCode(r),
    },
    {
      key: "class",
      headName: "Class",
      minWidth: 180,
      render: (r) => classNameLabel(r.batchTermSubject?.batchTerm) || "—",
    },
    {
      key: "fullMarks",
      headName: "Full Marks",
      minWidth: 120,
      render: (r) => String(r.fullMarks ?? "—"),
    },
    {
      key: "passMarks",
      headName: "Pass Marks",
      minWidth: 120,
      render: (r) => String(r.passMarks ?? "—"),
    },
    {
      key: "examDateBs",
      headName: "Exam Date (BS)",
      minWidth: 140,
      render: (r) => r.examDateBs ?? "—",
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Exam Subjects"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Exam Subjects", link: "/teacher/exam-subjects" },
        ]}
        actions={
          <Link to="/teacher/exam-subjects/create">
            <Button variant="primary" size="sm">
              + Create
            </Button>
          </Link>
        }
      />

      {mode === "list" && (
        <GenericTable
          tableHeads={head}
          data={rows}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search exam subjects..."
          emptyTitle="No exam subjects yet."
          pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
          renderActions={(r) => (
            <DropdownMenuItem
              onClick={() => {
                setEditRecord(r);
                setMode("edit");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
            >
              <PenSquare className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          onDelete={(r) => setDeleteId(r.id)}
        />
      )}

      {mode === "edit" && editRecord && (
        <EditExamSubjectForm
          key={editRecord.id}
          record={editRecord}
          exams={exams}
          btsList={btsList}
          examsLoading={examsQuery.isLoading}
          btsLoading={btsQuery.isLoading}
          isPending={updateMut.isPending}
          onCancel={() => {
            setMode("list");
            setEditRecord(null);
          }}
          onSubmit={(id, payload) => updateMut.mutate({ id, data: payload })}
        />
      )}

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Exam subject"
          onDelete={deleteExamSubject}
          onSuccess={() =>
            qc.invalidateQueries({
              queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS],
            })
          }
        />
      )}
    </div>
  );
}
