import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listTeachingAssignments,
  deleteTeachingAssignment,
  type T_TEACHING_ASSIGNMENT,
  type T_TEACHER_OPTION,
  type T_BATCH_TERM_SUBJECT_OPTION,
} from "./service/service";

const LIMIT = 10;

function teacherLabel(t: T_TEACHER_OPTION) {
  const e = t.employee;
  const name = [e?.firstName, e?.middleName, e?.lastName].filter(Boolean).join(" ");
  return name ? `${name}${e?.employeeCode ? ` (${e.employeeCode})` : ""}` : t.id;
}

function btsLabel(b: T_BATCH_TERM_SUBJECT_OPTION) {
  const subject = b.subject ? `${b.subject.code ?? ""}${b.subject.name ? ` - ${b.subject.name}` : ""}`.trim() : "";
  const term = b.batchTerm ? `Term ${b.batchTerm.termNumber ?? b.batchTerm.name ?? ""}` : "";
  const batch = b.batchTerm?.batch?.name ? ` • ${b.batchTerm.batch.name}` : "";
  return [subject, term].filter(Boolean).join(" / ") + batch || b.id;
}

export default function AdminTeachingAssignmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, search, page],
    queryFn: () => listTeachingAssignments({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_TEACHING_ASSIGNMENT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_TEACHING_ASSIGNMENT>[] = [
    { key: "teacherId", headName: "Teacher", render: (r) => (r.teacher ? teacherLabel(r.teacher) : r.teacherId) },
    {
      key: "batchTermSubjectId",
      headName: "Subject / Term",
      render: (r) => (r.batchTermSubject ? btsLabel(r.batchTermSubject) : r.batchTermSubjectId),
    },
    { key: "assignedDateBs", headName: "Assigned (BS)" },
    { key: "endDateBs", headName: "End (BS)", render: (r) => r.endDateBs || "—" },
    {
      key: "isActive",
      headName: "Active",
      render: (r) => (
        <Badge variant={r.isActive === false ? "destructive" : "default"}>
          {r.isActive === false ? "Inactive" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Teaching Assignments"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Teaching Assignments", link: "/admin/teaching-assignments" }]}
        createPage="/admin/teaching-assignments/create"
        createPageTitle="New Assignment"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onDelete={(r) => setDeleteId(r.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No teaching assignments found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search assignments..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Teaching assignment"
          onDelete={deleteTeachingAssignment}
        />
      )}
    </div>
  );
}
