import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import QUERY_KEYS from "@/lib/query-keys";
import type { T_TEACHING_ASSIGNMENT } from "./service/service";

import { listTeachingAssignments, createTeachingAssignment } from "./service/service";

const LIMIT = 10;

export default function AdminTeachingAssignmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, search, page],
    queryFn: () => listTeachingAssignments({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_TEACHING_ASSIGNMENT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const head: T_TableHead<T_TEACHING_ASSIGNMENT>[] = [
    { key: "studentName", headName: "Student Name", minWidth: 220 },
    { key: "courseCode", headName: "Course Code", minWidth: 180 },
    { key: "subjectId", headName: "Subject ID", minWidth: 200 },
    { key: "termNumber", headName: "Term", minWidth: 80 },
    { key: "assignedAt", headName: "Assigned At", minWidth: 180 },
  ];

  // Create form state
  const [form, setForm] = useState({ studentId: "", studentName: "", courseCode: "", subjectId: "", termNumber: 1 });
  const mutation = useMutation({
    mutationFn: () => createTeachingAssignment(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST] }); toast.success("Assignment created"); setCreateOpen(false); },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Teaching Assignments"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Teaching Assignments", link: "/admin/teaching-assignments" }]}
        createPage="/admin/teaching-assignments?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search assignments..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Assignment</Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={setSearch}
        emptyTitle="No teaching assignments found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search assignments..."
      />

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border p-6 space-y-3">
            <h3 className="font-semibold">Create Teaching Assignment</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Student ID *</label>
                <Input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Student Name *</label>
                <Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Course Code *</label>
                <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="e.g. COMP101" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Subject ID *</label>
                <Input value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Term Number *</label>
                <Input type="number" value={form.termNumber} onChange={(e) => setForm({ ...form, termNumber: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={!form.studentId || !form.subjectId || !form.termNumber || mutation.isPending}
                onClick={async () => { await mutation.mutateAsync(); }}>
                {mutation.isPending ? "Saving..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}