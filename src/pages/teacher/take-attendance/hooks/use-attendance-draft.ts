import { useCallback, useMemo, useState } from "react";
import {
  emptyAttendanceCounts,
  isAttendanceStatus,
  type TAttendanceCounts,
  type TAttendanceStatus,
} from "../attendance-status";
import type { T_ATTENDANCE_RECORD_INPUT, T_ROSTER_ENTRY } from "../service/service";

export type T_DraftEntry = {
  status: TAttendanceStatus;
  remarks: string;
};

export type T_DraftMap = Record<string, T_DraftEntry>;

function buildDraft(rows: T_ROSTER_ENTRY[]): T_DraftMap {
  const next: T_DraftMap = {};
  for (const row of rows) {
    const saved = row.record;
    next[row.student.id] = {
      status: isAttendanceStatus(saved?.status) ? saved.status : "PRESENT",
      remarks: saved?.remarks ?? "",
    };
  }
  return next;
}

/**
 * The one shared draft for every view (desktop table, mobile list, swipe).
 * Keyed by studentId so switching views never loses data.
 */
export function useAttendanceDraft(rows: T_ROSTER_ENTRY[]) {
  const [loadedRows, setLoadedRows] = useState(rows);
  const [draft, setDraft] = useState<T_DraftMap>(() => buildDraft(rows));
  const [baseline, setBaseline] = useState(() => JSON.stringify(buildDraft(rows)));

  // Re-initialise when the loaded roster/session changes (derived-state pattern,
  // avoids a state-syncing effect).
  if (rows !== loadedRows) {
    const next = buildDraft(rows);
    setLoadedRows(rows);
    setDraft(next);
    setBaseline(JSON.stringify(next));
  }

  const isDirty = baseline !== "" && JSON.stringify(draft) !== baseline;

  const setStatus = useCallback((studentId: string, status: TAttendanceStatus) => {
    setDraft((prev) => {
      const current = prev[studentId] ?? { status: "PRESENT" as const, remarks: "" };
      if (current.status === status) return prev;
      return {
        ...prev,
        [studentId]: {
          status,
          remarks: status === "LEAVE" ? current.remarks : "",
        },
      };
    });
  }, []);

  const setRemarks = useCallback((studentId: string, remarks: string) => {
    setDraft((prev) => {
      const current = prev[studentId] ?? { status: "PRESENT" as const, remarks: "" };
      return { ...prev, [studentId]: { status: current.status, remarks } };
    });
  }, []);

  /** Undo in the swipe view: back to the default state for that student. */
  const resetStatus = useCallback((studentId: string) => {
    setDraft((prev) => ({
      ...prev,
      [studentId]: { status: "PRESENT", remarks: "" },
    }));
  }, []);

  const markAllPresent = useCallback(() => {
    setDraft((prev) => {
      const next: T_DraftMap = {};
      for (const studentId of Object.keys(prev)) {
        next[studentId] = { status: "PRESENT", remarks: "" };
      }
      return next;
    });
  }, []);

  const counts = useMemo<TAttendanceCounts>(() => {
    const next = emptyAttendanceCounts();
    for (const entry of Object.values(draft)) next[entry.status] += 1;
    return next;
  }, [draft]);

  const invalidStudentIds = useMemo(
    () =>
      rows
        .filter((row) => {
          const entry = draft[row.student.id];
          return entry?.status === "LEAVE" && entry.remarks.trim().length === 0;
        })
        .map((row) => row.student.id),
    [draft, rows],
  );

  const toRecords = useCallback((): T_ATTENDANCE_RECORD_INPUT[] => {
    return rows.map((row) => {
      const entry = draft[row.student.id];
      const status = entry?.status ?? "PRESENT";
      const remarks = entry?.remarks.trim() ?? "";
      return {
        studentId: row.student.id,
        status,
        remarks: status === "LEAVE" ? remarks : null,
      };
    });
  }, [draft, rows]);

  const markSaved = useCallback(() => {
    setBaseline(JSON.stringify(draft));
  }, [draft]);

  /** Throws the draft away and restores the last loaded (server) values. */
  const resetDraft = useCallback(() => {
    const next = buildDraft(rows);
    setDraft(next);
    setBaseline(JSON.stringify(next));
  }, [rows]);

  return {
    draft,
    counts,
    isDirty,
    invalidStudentIds,
    setStatus,
    setRemarks,
    resetStatus,
    markAllPresent,
    toRecords,
    markSaved,
    resetDraft,
  };
}

export type T_AttendanceDraft = ReturnType<typeof useAttendanceDraft>;
