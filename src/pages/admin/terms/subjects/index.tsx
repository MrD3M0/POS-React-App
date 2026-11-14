import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Users } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import NoData from "@/components/common/no-data";
import SelectCommand from "@/components/common/select-command";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  addTermSubject,
  getTerm,
  listSubjectOptions,
  listTermSubjects,
  removeTermSubject,
  type T_TERM_SUBJECT,
} from "./service";

function teacherNames(row: T_TERM_SUBJECT): string {
  const names = (row.assignments ?? [])
    .map((assignment) => {
      const employee = assignment.teacher?.employee;
      if (!employee) return null;
      return [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(" ");
    })
    .filter(Boolean) as string[];
  return names.length > 0 ? names.join(", ") : "—";
}

/**
 * Term → Subjects: the subjects taught inside one term (BatchTerm), i.e. the
 * `batch-term-subject` rows. This is the page that was missing from the admin
 * UI: the term list could not show or add its subjects.
 */
export default function AdminTermSubjectsPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [creditHour, setCreditHour] = useState("3");
  const [isElective, setIsElective] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const termQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_GET, id],
    queryFn: () => getTerm(id),
    enabled: Boolean(id),
  });

  const subjectsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_SUBJECTS, id],
    queryFn: () => listTermSubjects(id),
    enabled: Boolean(id),
  });

  const optionsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SUBJECT_LIST, "options"],
    queryFn: listSubjectOptions,
    staleTime: 60_000,
  });

  const addMut = useMutation({
    mutationFn: addTermSubject,
    onSuccess: () => {
      toast.success("Subject added to this term.");
      setSubjectId("");
      setCreditHour("3");
      setIsElective(false);
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TERM_SUBJECTS, id] });
    },
    onError: (error) =>
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not add the subject.",
      ),
  });

  const options = useMemo(
    () =>
      (optionsQuery.data ?? []).map((subject) => ({
        value: subject.id,
        label: `${subject.code ? `${subject.code} — ` : ""}${subject.name ?? ""}`,
        searchValues: `${subject.code ?? ""} ${subject.name ?? ""}`,
      })),
    [optionsQuery.data],
  );

  const rows = subjectsQuery.data?.rows ?? [];
  const term = termQuery.data;
  const termLabel =
    [term?.name].filter(Boolean).join(" ") || "Term subjects";

  const submit = () => {
    const hours = Number(creditHour);
    if (!subjectId) {
      toast.error("Pick a subject first.");
      return;
    }
    if (!Number.isFinite(hours) || hours <= 0) {
      toast.error("Credit hour must be a positive number.");
      return;
    }
    addMut.mutate({
      batchTermId: id,
      subjectId,
      creditHour: hours,
      isElective,
    });
  };

  if (termQuery.isLoading || subjectsQuery.isLoading) return <ScreenLoader />;
  if (subjectsQuery.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Term Subjects"
        description={
          term
            ? `${termLabel} · subjects taught in this term, with the assigned teachers.`
            : "Subjects taught in this term, with the assigned teachers."
        }
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Terms", link: "/admin/terms" },
          { title: "Subjects", link: `/admin/terms/${id}/subjects` },
        ]}
        backPage="/admin/terms"
        backPageTitle="Back to Terms"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void subjectsQuery.refetch()}
            loading={subjectsQuery.isFetching}
          >
            {!subjectsQuery.isFetching ? (
              <RefreshCw className="size-3.5" />
            ) : null}
            Refresh
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 items-end gap-3 p-4 md:grid-cols-[1fr_140px_auto_auto]">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Subject</p>
            <SelectCommand
              options={options}
              value={subjectId}
              onChange={setSubjectId}
              placeholder="Pick a subject"
              searchPlaceholder="Search subjects…"
              loading={optionsQuery.isLoading}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Credit hour
            </p>
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={creditHour}
              onChange={(event) => setCreditHour(event.target.value)}
            />
          </div>
          <label className="flex h-8.5 items-center gap-2 text-sm">
            <Checkbox
              checked={isElective}
              onCheckedChange={(checked) => setIsElective(checked === true)}
            />
            Elective
          </label>
          <Button
            size="sm"
            onClick={submit}
            loading={addMut.isPending}
            disabled={!subjectId}
          >
            <Plus className="size-3.5" />
            Add subject
          </Button>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoData
              title="No subjects in this term yet"
              description="Add the subjects taught in this term above. Teaching assignments are created from the Teaching Assignments page."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Credit hour
                  </th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Teacher(s)</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-medium">
                      {row.subject?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.subject?.code ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {row.creditHour}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={row.isElective ? "warning" : "outline"}>
                        {row.isElective ? "Elective" : "Core"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-3.5 shrink-0" />
                        {teacherNames(row)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="dim"
                        size="sm"
                        onClick={() => setDeleteId(row.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {deleteId ? (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Term subject"
          onDelete={removeTermSubject}
          onSuccess={() => {
            setDeleteId(null);
            qc.invalidateQueries({
              queryKey: [QUERY_KEYS.ADMIN_TERM_SUBJECTS, id],
            });
          }}
        />
      ) : null}
    </div>
  );
}
