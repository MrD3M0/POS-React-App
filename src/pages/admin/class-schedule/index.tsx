import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { ActiveStatusBadge } from "@/components/ui/status-badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { InputWithSwitch } from "@/components/input-with-switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_UseQueryError } from "@/types/common";
import WeeklyGrid from "./components/weekly-grid";
import {
  listClassSchedules,
  deleteClassSchedule,
  createClassSchedule,
  listPeriodOptions,
  listTeachingAssignmentOptions,
  type T_CLASS_SCHEDULE,
  type T_PERIOD_OPTION,
  type T_TEACHING_ASSIGNMENT_OPTION,
} from "./service/service";

const LIMIT = 10;

function teacherLabel(a?: T_CLASS_SCHEDULE["teachingAssignment"]) {
  const e = a?.teacher?.employee;
  if (!e) return "—";
  const name = [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");
  return name ? `${name}${e.employeeCode ? ` (${e.employeeCode})` : ""}` : "—";
}

function subjectLabel(a?: T_CLASS_SCHEDULE["teachingAssignment"]) {
  const bts = a?.batchTermSubject;
  if (!bts) return "—";
  const subject = bts.subject ? `${bts.subject.code ?? ""}${bts.subject.name ? ` - ${bts.subject.name}` : ""}`.trim() : "";
  const term = bts.batchTerm ? `Term ${bts.batchTerm.termNumber ?? bts.batchTerm.name ?? ""}` : "";
  const batch = bts.batchTerm?.batch?.name ? ` • ${bts.batchTerm.batch.name}` : "";
  return [subject, term].filter(Boolean).join(" / ") + batch || "—";
}

function periodLabel(p?: T_PERIOD_OPTION | T_CLASS_SCHEDULE["period"]) {
  if (!p) return "—";
  return `${p.name} (${p.startTime}–${p.endTime})`;
}

function assignmentOptionLabel(a: T_TEACHING_ASSIGNMENT_OPTION) {
  const e = a.teacher?.employee;
  const name = e ? [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") : "";
  const subject = a.batchTermSubject?.subject
    ? `${a.batchTermSubject.subject.code ?? ""}${a.batchTermSubject.subject.name ? ` - ${a.batchTermSubject.subject.name}` : ""}`.trim()
    : "";
  const batch = a.batchTermSubject?.batchTerm?.batch?.name ?? "";
  return [name, subject, batch].filter(Boolean).join(" • ") || a.id;
}

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

type TView = "list" | "grid";

type TCellDraft = {
  dayOfWeek: string;
  periodId: string;
  teachingAssignmentId: string;
  room: string;
  effectiveFromBs: string;
  effectiveToBs: string;
  isActive: boolean;
};

const EMPTY_DRAFT: TCellDraft = {
  dayOfWeek: "",
  periodId: "",
  teachingAssignmentId: "",
  room: "",
  effectiveFromBs: "",
  effectiveToBs: "",
  isActive: true,
};

export default function AdminClassSchedulesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [view, setView] = useState<TView>("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Grid controls
  const [gridView, setGridView] = useState<"class" | "teacher">("class");
  const [showSaturday, setShowSaturday] = useState(false);
  const [draft, setDraft] = useState<TCellDraft | null>(null);
  const [dayFilter, setDayFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CLASS_SCHEDULE_LIST, search, page, dayFilter, periodFilter],
    queryFn: () =>
      listClassSchedules({
        page,
        limit: LIMIT,
        search,
        dayOfWeek: dayFilter || undefined,
        periodId: periodFilter || undefined,
      }),
  });

  const allSchedulesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CLASS_SCHEDULE_LIST, "grid", "all"],
    queryFn: () => listClassSchedules({ page: 1, limit: -1 }),
    enabled: view === "grid",
  });

  const periodsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP_PERIOD, "grid"],
    queryFn: () => listPeriodOptions({ page: 1, limit: -1 }),
  });

  const assignmentsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, "select", "unlimited"],
    queryFn: () => listTeachingAssignmentOptions({ page: 1, limit: -1 }),
    enabled: draft !== null,
  });

  const assignmentOptions = useMemo(
    () =>
      (assignmentsQuery.data?.data?.data ?? [])
        .filter((a) => a.isActive !== false)
        .map((a) => ({
          label: assignmentOptionLabel(a),
          value: a.id,
          searchValues: assignmentOptionLabel(a),
        })),
    [assignmentsQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: (input: TCellDraft) =>
      createClassSchedule({
        teachingAssignmentId: input.teachingAssignmentId,
        periodId: input.periodId,
        dayOfWeek: input.dayOfWeek,
        room: input.room.trim() || undefined,
        effectiveFromBs: input.effectiveFromBs,
        effectiveToBs: input.effectiveToBs.trim() || undefined,
        isActive: input.isActive,
      }),
    onSuccess: () => {
      toast.success("Class schedule created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CLASS_SCHEDULE_LIST] });
      setDraft(null);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create class schedule.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_CLASS_SCHEDULE[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_CLASS_SCHEDULE>[] = [
    { key: "teacher", headName: "Teacher", render: (r) => teacherLabel(r.teachingAssignment) },
    { key: "subject", headName: "Subject / Term / Batch", render: (r) => subjectLabel(r.teachingAssignment) },
    { key: "dayOfWeek", headName: "Day" },
    { key: "periodId", headName: "Period", render: (r) => periodLabel(r.period) },
    { key: "room", headName: "Room", render: (r) => r.room || "—" },
    { key: "effectiveFromBs", headName: "From (BS)" },
    { key: "effectiveToBs", headName: "To (BS)", render: (r) => r.effectiveToBs || "—" },
    {
      key: "isActive",
      headName: "Active",
      render: (r) => <ActiveStatusBadge active={r.isActive !== false} />,
    },
  ];

  const submitDraft = () => {
    if (!draft) return;
    if (!draft.teachingAssignmentId) {
      toast.error("Select a teaching assignment");
      return;
    }
    if (!draft.effectiveFromBs) {
      toast.error("Select the effective from date (BS)");
      return;
    }
    if (draft.effectiveToBs && draft.effectiveToBs < draft.effectiveFromBs) {
      toast.error("End date must be on or after the start date");
      return;
    }
    createMutation.mutate(draft);
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Class Schedules"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Class Schedules", link: "/admin/class-schedules" },
        ]}
        createPage="/admin/class-schedules/create"
        createPageTitle="New Schedule"
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(value) => setView(value as TView)}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="grid">Weekly grid</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "grid" ? (
          <div className="flex flex-wrap items-center gap-3">
            <SelectCommand
              className="w-40"
              hideSearch
              value={gridView}
              onChange={(value) => setGridView(value as "class" | "teacher")}
              options={[
                { label: "By class", value: "class" },
                { label: "By teacher", value: "teacher" },
              ]}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={showSaturday}
                onCheckedChange={(checked) => setShowSaturday(checked === true)}
                aria-label="Show Saturday"
              />
              Saturday
            </label>
            <Badge variant="outline">Click a cell to add a class</Badge>
          </div>
        ) : null}
      </div>

      {view === "list" ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SelectCommand
              className="w-36"
              hideSearch
              value={dayFilter}
              onChange={(value) => {
                setDayFilter(value);
                setPage(1);
              }}
              options={[
                { label: "All days", value: "" },
                ...Object.entries(DAY_LABELS).map(([value, label]) => ({ label, value })),
              ]}
            />
            <SelectCommand
              className="w-52"
              value={periodFilter}
              onChange={(value) => {
                setPeriodFilter(value);
                setPage(1);
              }}
              options={[
                { label: "All periods", value: "" },
                ...(periodsQuery.data?.data?.data ?? []).map((period) => ({
                  label: periodLabel(period),
                  value: period.id,
                })),
              ]}
              searchPlaceholder="Search periods..."
            />
            {dayFilter || periodFilter ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDayFilter("");
                  setPeriodFilter("");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
          <GenericTable
            tableHeads={head}
            data={rows}
            onEdit={(r) => `/admin/class-schedules/edit/${r.id}`}
            onDelete={(r) => setDeleteId(r.id)}
            onSearch={(value) => { setSearch(value); setPage(1); }}
            emptyTitle="No class schedules found."
            pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
            searchPlaceholder="Search schedules..."
          />
        </>
      ) : allSchedulesQuery.isError || periodsQuery.isError ? (
        <AlertHandler variant="error" />
      ) : (
        <WeeklyGrid
          schedules={allSchedulesQuery.data?.data?.data ?? []}
          periods={periodsQuery.data?.data?.data ?? []}
          showSaturday={showSaturday}
          view={gridView}
          isLoading={allSchedulesQuery.isLoading || periodsQuery.isLoading}
          onCreate={(dayOfWeek, periodId) =>
            setDraft({ ...EMPTY_DRAFT, dayOfWeek, periodId })
          }
          onEdit={(id) => navigate(`/admin/class-schedules/edit/${id}`)}
        />
      )}

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Class schedule"
          onDelete={deleteClassSchedule}
        />
      )}

      {/* Cell create dialog — day and period come from the clicked cell */}
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="sm:max-w-lg">
          {draft ? (
            <>
              <DialogHeader>
                <DialogTitle>Add class</DialogTitle>
                <DialogDescription>
                  {DAY_LABELS[draft.dayOfWeek] ?? draft.dayOfWeek} ·{" "}
                  {periodLabel(
                    (periodsQuery.data?.data?.data ?? []).find((p) => p.id === draft.periodId),
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-sm font-medium">Teaching assignment</p>
                  <SelectCommand
                    value={draft.teachingAssignmentId}
                    onChange={(value) =>
                      setDraft((previous) =>
                        previous ? { ...previous, teachingAssignmentId: value } : previous,
                      )
                    }
                    options={assignmentOptions}
                    placeholder={
                      assignmentsQuery.isLoading
                        ? "Loading assignments..."
                        : "Select teacher / subject..."
                    }
                    searchPlaceholder="Search teacher, subject or batch..."
                    loading={assignmentsQuery.isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium">Room</p>
                    <input
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={draft.room}
                      onChange={(event) =>
                        setDraft((previous) =>
                          previous ? { ...previous, room: event.target.value } : previous,
                        )
                      }
                      placeholder="e.g. Room 101"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium">Status</p>
                    <InputWithSwitch
                      value={draft.isActive}
                      onChange={(value) =>
                        setDraft((previous) =>
                          previous ? { ...previous, isActive: value } : previous,
                        )
                      }
                      labels={{ on: "Active", off: "Inactive" }}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium">Effective from (BS)</p>
                    <BsDatePicker
                      value={draft.effectiveFromBs}
                      valueFormat="bs"
                      lang="en"
                      placeholder="Select date"
                      onChange={(value) =>
                        setDraft((previous) =>
                          previous
                            ? {
                                ...previous,
                                effectiveFromBs: typeof value === "string" ? value : "",
                              }
                            : previous,
                        )
                      }
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium">Effective to (BS)</p>
                    <BsDatePicker
                      value={draft.effectiveToBs}
                      valueFormat="bs"
                      lang="en"
                      placeholder="Optional"
                      onChange={(value) =>
                        setDraft((previous) =>
                          previous
                            ? {
                                ...previous,
                                effectiveToBs: typeof value === "string" ? value : "",
                              }
                            : previous,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button onClick={submitDraft} loading={createMutation.isPending}>
                  Add class
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
