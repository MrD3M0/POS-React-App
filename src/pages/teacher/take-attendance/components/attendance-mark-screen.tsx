import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceListView } from "./attendance-list-view";
import { AttendanceSheetAlerts } from "./attendance-alerts";
import { AttendanceSaveBar } from "./attendance-save-bar";
import { AttendanceListSkeleton } from "./attendance-skeleton";
import { AttendanceSwipeView } from "./attendance-swipe-view";
import type { T_AttendanceView } from "../attendance-utils";
import type { T_AttendanceDraft } from "../hooks/use-attendance-draft";
import type { T_HOLIDAY, T_ROSTER_ENTRY } from "../service/service";

type T_Props = {
  title: string;
  subtitle: string;
  rows: T_ROSTER_ENTRY[];
  draft: T_AttendanceDraft;
  view: T_AttendanceView;
  onViewChange: (view: T_AttendanceView) => void;
  holiday: T_HOLIDAY | null;
  isLocked: boolean;
  hasSavedSession: boolean;
  error: unknown;
  onRetry: () => void;
  isLoading: boolean;
  showErrors: boolean;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
};

export function AttendanceMarkScreen({
  title,
  subtitle,
  rows,
  draft,
  view,
  onViewChange,
  holiday,
  isLocked,
  hasSavedSession,
  error,
  onRetry,
  isLoading,
  showErrors,
  saving,
  onBack,
  onSave,
}: T_Props) {
  const readOnly = isLocked || Boolean(holiday);

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-3 py-2.5 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Back to class selection"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {hasSavedSession ? (
          <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">
            Saved
          </Badge>
        ) : null}
      </header>

      <div className="space-y-3 px-4 py-3">
        <AttendanceSheetAlerts
          holiday={holiday}
          isLocked={isLocked}
          error={error}
          onRetry={onRetry}
        />

        <Tabs value={view} onValueChange={(next) => onViewChange(next as T_AttendanceView)}>
          <TabsList className="w-full">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="swipe">Swipe</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-3">
            {isLoading ? (
              <AttendanceListSkeleton />
            ) : rows.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                No approved students in this batch.
              </p>
            ) : (
              <AttendanceListView
                rows={rows}
                draft={draft.draft}
                onStatus={draft.setStatus}
                onRemarks={draft.setRemarks}
                invalidIds={draft.invalidStudentIds}
                showErrors={showErrors}
                disabled={readOnly || saving}
              />
            )}
          </TabsContent>

          <TabsContent value="swipe" className="mt-3">
            {isLoading ? (
              <AttendanceListSkeleton />
            ) : (
              <AttendanceSwipeView
                rows={rows}
                draft={draft.draft}
                counts={draft.counts}
                onStatus={draft.setStatus}
                onRemarks={draft.setRemarks}
                resetStatus={draft.resetStatus}
                invalidIds={draft.invalidStudentIds}
                showErrors={showErrors}
                disabled={readOnly || saving}
                saving={saving}
                onSave={onSave}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {view === "list" && rows.length > 0 ? (
        <AttendanceSaveBar
          variant="mobile"
          counts={draft.counts}
          total={rows.length}
          saving={saving}
          disabled={readOnly}
          onSave={onSave}
        />
      ) : null}
    </div>
  );
}
