import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { formatBs, todayBs } from "@/lib/bs-date";
import PageHeader from "@/components/common/page-header";
import { AttendanceClassPicker } from "./components/attendance-class-picker";
import { AttendanceClassSelect } from "./components/attendance-class-select";
import { AttendanceMarkScreen } from "./components/attendance-mark-screen";
import { AttendanceSaveBar } from "./components/attendance-save-bar";
import { AttendanceSheetAlerts, SavedSessionBadge } from "./components/attendance-alerts";
import { AttendanceSummary } from "./components/attendance-summary";
import { AttendanceTable } from "./components/attendance-table";
import {
  AttendancePickerSkeleton,
  AttendanceTableSkeleton,
} from "./components/attendance-skeleton";
import { DiscardChangesDialog } from "./components/discard-changes-dialog";
import {
  assignmentSubjectLabel,
  formatBsDate,
  periodLabel,
  readStoredAttendanceView,
  storeAttendanceView,
  type T_AttendanceView,
} from "./attendance-utils";
import { useAttendanceData, type T_AttendanceSelection } from "./hooks/use-attendance-data";
import { useAttendanceDraft } from "./hooks/use-attendance-draft";
import { useMediaQuery } from "./hooks/use-media-query";
import { useSaveAttendance } from "./hooks/use-save-attendance";
import { useUnsavedChangesGuard } from "./hooks/use-unsaved-changes-guard";

type TMobileScreen = "select" | "mark";

export default function TeacherTakeAttendancePage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selection, setSelection] = useState<T_AttendanceSelection>({
    assignmentId: "",
    periodId: "",
    dateBs: formatBs(todayBs()),
  });
  const [mobileScreen, setMobileScreen] = useState<TMobileScreen>("select");
  const [view, setView] = useState<T_AttendanceView>(readStoredAttendanceView);
  const [showErrors, setShowErrors] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ run: () => void } | null>(null);
  const [pickerVersion, setPickerVersion] = useState(0);

  const data = useAttendanceData(selection);
  const draft = useAttendanceDraft(data.rows);
  const blocker = useUnsavedChangesGuard(draft.isDirty);
  const save = useSaveAttendance(() => {
    draft.markSaved();
    setShowErrors(false);
  });

  useEffect(() => {
    storeAttendanceView(view);
  }, [view]);

  const readOnly = data.isLocked || Boolean(data.holiday);
  const saving = save.isPending;

  const applySelection = useCallback(
    (patch: Partial<T_AttendanceSelection>) => {
      const apply = () => {
        setSelection((previous) => ({ ...previous, ...patch }));
        setShowErrors(false);
      };
      if (draft.isDirty) {
        setPendingAction({ run: apply });
        return;
      }
      apply();
    },
    [draft.isDirty],
  );

  const requestBackToSelect = useCallback(() => {
    const apply = () => setMobileScreen("select");
    if (draft.isDirty) {
      setPendingAction({ run: apply });
      return;
    }
    apply();
  }, [draft.isDirty]);

  const handleSave = useCallback(() => {
    if (!data.assignment || !selection.periodId) return;
    if (!data.assignment.teacherId) {
      toast.error("This class has no assigned teacher");
      return;
    }
    if (draft.invalidStudentIds.length > 0) {
      setShowErrors(true);
      toast.error("Add a remark for every student on leave");
      window.requestAnimationFrame(() => {
        const first = draft.invalidStudentIds[0];
        const field = document.querySelector<HTMLInputElement>(
          `[data-remarks-input="${first}"]`,
        );
        field?.focus();
      });
      return;
    }
    save.mutate({
      sessionId: data.session?.id ?? null,
      assignmentId: data.assignment.id,
      teacherId: data.assignment.teacherId,
      periodId: selection.periodId,
      dateBs: selection.dateBs,
      records: draft.toRecords(),
    });
  }, [data.assignment, data.session?.id, draft, save, selection]);

  const alerts = (
    <AttendanceSheetAlerts
      holiday={data.holiday}
      isLocked={data.isLocked}
      error={data.isError ? data.error : null}
      onRetry={data.refetch}
    />
  );

  const discardDialog = (
    <DiscardChangesDialog
      open={blocker.state === "blocked" || pendingAction !== null}
      description="You have unsaved attendance changes. Leaving this screen will discard them."
      onStay={() => {
        const hadPending = pendingAction !== null;
        if (blocker.state === "blocked") blocker.reset();
        setPendingAction(null);
        if (hadPending) setPickerVersion((version) => version + 1);
      }}
      onDiscard={() => {
        const action = pendingAction?.run;
        setPendingAction(null);
        if (blocker.state === "blocked") {
          blocker.proceed();
          return;
        }
        if (action) {
          draft.resetDraft();
          action();
        }
      }}
    />
  );

  const period = data.periods.find((item) => item.id === selection.periodId);
  const subtitle = [formatBsDate(selection.dateBs), period ? periodLabel(period) : ""]
    .filter(Boolean)
    .join(" · ");

  if (!isDesktop) {
    if (mobileScreen === "select" || !data.hasSelection) {
      return (
        <div className="min-h-screen space-y-5 p-4 pb-10">
          <div>
            <h1 className="text-xl font-medium">Take attendance</h1>
            <p className="text-sm text-muted-foreground">
              Choose a class, period and date to load the roster.
            </p>
          </div>

          {data.isLoading && data.assignments.length === 0 ? (
            <AttendancePickerSkeleton />
          ) : data.assignments.length === 0 ? (
            <EmptyAssignments />
          ) : (
            <AttendanceClassSelect
              key={pickerVersion}
              assignments={data.assignments}
              periods={data.periods}
              value={selection}
              onChange={applySelection}
              onContinue={() => setMobileScreen("mark")}
            />
          )}

          {alerts}
          {discardDialog}
        </div>
      );
    }

    return (
      <>
        <AttendanceMarkScreen
          key={`${selection.assignmentId}|${selection.periodId}|${selection.dateBs}`}
          title={assignmentSubjectLabel(data.assignment)}
          subtitle={subtitle}
          rows={data.rows}
          draft={draft}
          view={view}
          onViewChange={setView}
          holiday={data.holiday}
          isLocked={data.isLocked}
          hasSavedSession={Boolean(data.session)}
          error={data.isError ? data.error : null}
          onRetry={data.refetch}
          isLoading={data.isLoading}
          showErrors={showErrors}
          saving={saving}
          onBack={requestBackToSelect}
          onSave={handleSave}
        />
        {discardDialog}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 p-5">
      {discardDialog}
      <PageHeader
        title="Take attendance"
        description="Mark one class session, then save the whole roster at once."
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Take attendance", link: "/teacher/take-attendance" },
        ]}
      />

      {data.isLoading && data.assignments.length === 0 ? (
        <AttendancePickerSkeleton />
      ) : (
        <AttendanceClassPicker
          key={pickerVersion}
          assignments={data.assignments}
          periods={data.periods}
          value={selection}
          onChange={applySelection}
          loading={data.isLoading && !data.hasSelection}
          disabled={saving}
        />
      )}

      {alerts}

      {!data.isLoading && data.assignments.length === 0 ? <EmptyAssignments /> : null}

      {data.hasSelection && data.isError ? null : data.hasSelection && data.isLoading ? (
        <AttendanceTableSkeleton />
      ) : data.hasSelection && data.rows.length === 0 ? (
        <EmptyStudents />
      ) : data.hasSelection ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AttendanceSummary counts={draft.counts} />
            {data.session ? <SavedSessionBadge /> : null}
          </div>
          <AttendanceTable
            rows={data.rows}
            draft={draft.draft}
            onStatus={draft.setStatus}
            onRemarks={draft.setRemarks}
            invalidIds={draft.invalidStudentIds}
            showErrors={showErrors}
            disabled={readOnly || saving}
          />
          <AttendanceSaveBar
            variant="desktop"
            counts={draft.counts}
            total={data.rows.length}
            saving={saving}
            disabled={readOnly}
            onSave={handleSave}
            onMarkAllPresent={draft.markAllPresent}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a class, period and date to load the roster.
        </p>
      )}
    </div>
  );
}

function EmptyAssignments() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <GraduationCap className="mx-auto size-6 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium">No classes assigned to you yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ask an admin to assign you a class.
      </p>
    </div>
  );
}

function EmptyStudents() {
  return (
    <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
      No approved students in this batch.
    </p>
  );
}
