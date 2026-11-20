import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CalendarCheck, Search, Users } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import NoData from "@/components/common/no-data";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  bulkAddTermSubjects,
  getTerm,
  listSubjectOptions,
  listTermSubjects,
  removeTermSubject,
  updateTermSubject,
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

const axiosMessage = (error: unknown, fallback: string): string =>
  isAxiosError(error)
    ? ((error.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;

/**
 * Editable elective seats on an already-assigned row.
 * Blank = unlimited; a positive whole number = that many students may pick it.
 * Saves on blur / Enter, and reverts the field when the value is invalid.
 */
function SeatsEditor({
  row,
  disabled,
  onSave,
}: {
  row: T_TERM_SUBJECT;
  disabled: boolean;
  onSave: (value: number | null) => void;
}) {
  const toText = (value: number | null | undefined) =>
    value === null || value === undefined ? "" : String(value);
  const [value, setValue] = useState(toText(row.maxStudents));

  useEffect(() => {
    setValue(toText(row.maxStudents));
  }, [row.maxStudents]);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed === "") {
      if (row.maxStudents !== null && row.maxStudents !== undefined) onSave(null);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setValue(toText(row.maxStudents));
      toast.error("Students must be a whole number of at least 1 (blank = unlimited).");
      return;
    }
    if (parsed !== row.maxStudents) onSave(parsed);
  };

  return (
    <Input
      type="number"
      min={1}
      step={1}
      value={value}
      disabled={disabled}
      placeholder="Unlimited"
      title="How many students may choose this elective. Blank = unlimited."
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") (event.target as HTMLInputElement).blur();
      }}
      className="ml-auto h-8 w-24"
    />
  );
}

/** Picked subject with its per-row credit hour / elective override / seats. */
type T_Picked = { creditHour: string; isElective: boolean; maxStudents: string };

const DEFAULT_PICK: T_Picked = { creditHour: "3", isElective: false, maxStudents: "" };

/**
 * Term → Subjects: the subjects taught inside one term (BatchTerm), i.e. the
 * `batch-term-subject` rows. Assigns multiple subjects in ONE atomic bulk
 * request; already-assigned subjects are disabled in the picker.
 */
export default function AdminTermSubjectsPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Record<string, T_Picked>>({});
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

  const assignedSubjectIds = useMemo(
    () => new Set((subjectsQuery.data?.rows ?? []).map((row) => row.subjectId)),
    [subjectsQuery.data],
  );

  const bulkMut = useMutation({
    mutationFn: bulkAddTermSubjects,
    onSuccess: (result) => {
      const created =
        (result as { data?: { created?: number } })?.data?.created ?? 0;
      toast.success(
        `${created} subject${created === 1 ? "" : "s"} assigned to this term.`,
      );
      setPicked({});
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TERM_SUBJECTS, id] });
    },
    onError: (error) =>
      toast.error(axiosMessage(error, "Could not assign the subjects.")),
  });

  const updateSeatsMut = useMutation({
    mutationFn: ({ rowId, maxStudents }: { rowId: string; maxStudents: number | null }) =>
      updateTermSubject(rowId, { maxStudents }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TERM_SUBJECTS, id] });
    },
    onError: (error) =>
      toast.error(axiosMessage(error, "Could not update the elective seats.")),
  });

  const removeWrapped = async (rowId: string) => {
    try {
      await removeTermSubject(rowId);
      return { message: "Deleted" };
    } catch (error) {
      // Backend 409 lists exactly what is linked (assignments, exams, sessions).
      toast.error(axiosMessage(error, "Cannot remove this subject."));
      return { message: "" }; // nothing changed — skip invalidation
    }
  };

  const options = useMemo(
    () =>
      (optionsQuery.data ?? []).map((subject) => ({
        id: subject.id,
        code: subject.code ?? "",
        name: subject.name ?? "",
      })),
    [optionsQuery.data],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (subject) =>
        subject.code.toLowerCase().includes(query) ||
        subject.name.toLowerCase().includes(query),
    );
  }, [options, search]);

  const pickedIds = Object.keys(picked);
  const rows = subjectsQuery.data?.rows ?? [];
  const term = termQuery.data;
  const isCurrentTerm =
    term?.termNumber !== undefined &&
    term?.batch?.currentTermNumber !== null &&
    term?.batch?.currentTermNumber === term?.termNumber;
  const currentTermLabel =
    term?.batch?.course?.system === "YEARLY" ? "Current year" : "Current semester";
  const termLabel =
    [term?.name].filter(Boolean).join(" ") || "Term subjects";

  const togglePick = (subjectId: string, checked: boolean) =>
    setPicked((prev) => {
      const next = { ...prev };
      if (checked) next[subjectId] = { ...DEFAULT_PICK };
      else delete next[subjectId];
      return next;
    });

  const updatePick = (subjectId: string, patch: Partial<T_Picked>) =>
    setPicked((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], ...patch },
    }));

  const submitBulk = () => {
    const payload = pickedIds.map((subjectId) => {
      const pick = picked[subjectId];
      const seats = pick.maxStudents.trim();
      return {
        subjectId,
        creditHour: Number(pick.creditHour),
        isElective: pick.isElective,
        maxStudents: pick.isElective && seats !== "" ? Number(seats) : null,
      };
    });
    if (payload.length === 0) return;
    const invalid = payload.find(
      (row) => !Number.isFinite(row.creditHour) || row.creditHour <= 0,
    );
    if (invalid) {
      toast.error("Credit hour must be a positive number for every picked subject.");
      return;
    }
    const badSeats = payload.find(
      (row) =>
        row.isElective &&
        row.maxStudents !== null &&
        (!Number.isInteger(row.maxStudents) || row.maxStudents < 1),
    );
    if (badSeats) {
      toast.error(
        "Students for an elective must be a whole number of at least 1 (leave blank for unlimited).",
      );
      return;
    }
    bulkMut.mutate({ batchTermId: id, subjects: payload });
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
          <>
            {isCurrentTerm ? (
              <Badge variant="success">
                <CalendarCheck className="size-3" />
                {currentTermLabel}
              </Badge>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void subjectsQuery.refetch()}
              loading={subjectsQuery.isFetching}
            >
              Refresh
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              Pick subjects to assign — assigned ones are disabled
            </p>
            <Button
              size="sm"
              onClick={submitBulk}
              loading={bulkMut.isPending}
              disabled={pickedIds.length === 0}
            >
              Assign {pickedIds.length > 0 ? pickedIds.length : ""}{" "}
              {pickedIds.length === 1 ? "subject" : "subjects"}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subjects…"
              className="pl-8"
            />
          </div>

          {optionsQuery.isLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Loading subjects…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No subjects match “{search}”.
            </p>
          ) : (
            <div className="max-h-64 divide-y overflow-y-auto rounded-md border">
              {filtered.map((subject) => {
                const isAssigned = assignedSubjectIds.has(subject.id);
                const pick = picked[subject.id];
                return (
                  <div key={subject.id} className="px-3 py-2">
                    <label
                      className={
                        isAssigned
                          ? "flex cursor-not-allowed items-center gap-2.5 opacity-60"
                          : "flex cursor-pointer items-center gap-2.5"
                      }
                    >
                      <Checkbox
                        checked={Boolean(pick)}
                        disabled={isAssigned}
                        onCheckedChange={(checked) =>
                          togglePick(subject.id, checked === true)
                        }
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        <span className="font-medium">{subject.code}</span>
                        <span className="text-muted-foreground">
                          {" — "}
                          {subject.name}
                        </span>
                      </span>
                      {isAssigned ? <Badge variant="outline">Assigned</Badge> : null}
                    </label>

                    {pick ? (
                      <div className="mt-2 flex flex-wrap items-center gap-4 pl-7">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          Credit hour
                          <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={pick.creditHour}
                            onChange={(event) =>
                              updatePick(subject.id, {
                                creditHour: event.target.value,
                              })
                            }
                            className="h-8 w-20"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={pick.isElective}
                            onCheckedChange={(checked) => {
                              const isElective = checked === true;
                              updatePick(subject.id, {
                                isElective,
                                ...(isElective ? {} : { maxStudents: "" }),
                              });
                            }}
                          />
                          Elective
                        </label>
                        {pick.isElective ? (
                          <label
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                            title="How many students may choose this elective in this term. Leave blank for unlimited."
                          >
                            Students
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              value={pick.maxStudents}
                              onChange={(event) =>
                                updatePick(subject.id, {
                                  maxStudents: event.target.value,
                                })
                              }
                              placeholder="Unlimited"
                              className="h-8 w-24"
                            />
                          </label>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoData
              title="No subjects in this term yet"
              description="Assign the subjects taught in this term above. Teaching assignments are created from the Teaching Assignments page."
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
                  <th className="px-4 py-2.5 text-right font-medium">Students</th>
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
                    <td className="px-4 py-2.5 text-right">
                      {row.isElective ? (
                        <SeatsEditor
                          row={row}
                          disabled={updateSeatsMut.isPending}
                          onSave={(value) =>
                            updateSeatsMut.mutate({ rowId: row.id, maxStudents: value })
                          }
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
          onDelete={removeWrapped}
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
