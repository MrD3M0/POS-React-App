import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Check, X } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import type { T_UseQueryError } from "@/types/common";
import { approveStudent, listPendingStudents, rejectStudent, type T_PENDING_STUDENT } from "./service/service";
import { rejectStudentSchema, type RejectStudentFormValues } from "./schema/schema";

const LIMIT = 20;

function fullName(s: T_PENDING_STUDENT): string {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "—";
}

export default function PrincipalStudentApprovalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "student-approval", page, search],
    queryFn: () => listPendingStudents({ page, limit: LIMIT, search }),
  });

  const rejectForm = useForm<RejectStudentFormValues>({
    resolver: zodResolver(rejectStudentSchema),
    defaultValues: { reason: "" },
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveStudent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "student-approval"] });
      toast.success("Student approved.");
    },
    onError: (e: AxiosError<T_UseQueryError>) => toast.error(e.response?.data?.message ?? "Failed to approve student."),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectStudent(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "student-approval"] });
      setRejectId(null);
      rejectForm.reset({ reason: "" });
      toast.success("Student rejected.");
    },
    onError: (e: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(e, rejectForm.setError);
      toast.error(e.response?.data?.message ?? "Failed to reject student.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PENDING_STUDENT[] = Array.isArray(query.data?.data?.data ?? query.data?.data)
    ? (query.data.data.data ?? query.data.data)
    : [];
  const total = query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_PENDING_STUDENT>[] = [
    { key: "universityRegNo", headName: "Reg. No.", minWidth: 160 },
    { key: "name", headName: "Name", minWidth: 220, render: (s) => fullName(s) },
    { key: "batch", headName: "Batch", minWidth: 180, render: (s) => (s.batch ? s.batch.name ?? s.batch.course?.code ?? "—" : "—") },
    { key: "phone", headName: "Phone", minWidth: 150, render: (s) => s.phone ?? "—" },
    { key: "email", headName: "Email", minWidth: 200, render: (s) => s.email ?? "—" },
    { key: "approvalStatus", headName: "Approval", minWidth: 140, render: (s) => <Badge variant={s.approvalStatus === "APPROVED" ? "default" : "warning"}>{s.approvalStatus}</Badge> },
    {
      key: "action",
      headName: "Action",
      minWidth: 190,
      render: (s) => (
        <div className="flex gap-2">
          <Button variant="primary" size="sm" disabled={approveMut.isPending || rejectMut.isPending} onClick={() => approveMut.mutate(s.id)}>
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button variant="destructive" size="sm" disabled={approveMut.isPending || rejectMut.isPending} onClick={() => { setRejectId(s.id); rejectForm.reset({ reason: "" }); }}>
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Student Approval"
        breadCrumbItems={[
          { title: "Principal", link: "/principal/students/approval" },
          { title: "Student Approval", link: "/principal/students/approval" },
        ]}
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search pending students..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No pending students."
        renderRow={(s) => ({ universityRegNo: s.universityRegNo, name: fullName(s), phone: s.phone ?? "—", email: s.email ?? "—" } as Record<string, React.ReactNode>)}
      />

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-6">
            <h3 className="font-semibold">Reject Student</h3>
            <p className="mb-3 text-sm text-muted-foreground">Provide a clear reason. This action is recorded.</p>
            <Form {...rejectForm}>
              <form
                onSubmit={rejectForm.handleSubmit((data) => rejectMut.mutate({ id: rejectId, reason: data.reason.trim() }))}
                className="space-y-4"
              >
                <FormField
                  control={rejectForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Rejection reason..." {...field} />
                      </FormControl>
                      <FormDescription>Required for audit and student feedback.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setRejectId(null)} disabled={rejectMut.isPending}>Cancel</Button>
                  <Button type="submit" variant="destructive" size="sm" loading={rejectMut.isPending}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
