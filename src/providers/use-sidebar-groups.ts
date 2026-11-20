import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sidebar-open-groups";

type OpenGroups = Record<string, boolean>;

/** Reads and validates the persisted map; returns {} on any problem. */
function readStoredOpenGroups(): OpenGroups {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const groups: OpenGroups = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "boolean") groups[key] = value;
    }
    return groups;
  } catch {
    return {};
  }
}

/**
 * Single source of truth for which collapsible sidebar groups are open.
 *
 * The map only stores groups whose state was set explicitly (by clicking a
 * group header or "Collapse all"). A group with no entry falls back to
 * "open when it owns the current route", handled by the caller.
 */
export function useSidebarGroups() {
  const [openGroups, setOpenGroups] =
    useState<OpenGroups>(readStoredOpenGroups);

  // Persist every change; storage failures (private mode, quota) are ignored
  // so collapsing still works without persistence.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
    } catch {
      // Ignore write failures.
    }
  }, [openGroups]);

  const toggleGroup = useCallback((key: string, open: boolean) => {
    setOpenGroups((prev) => ({ ...prev, [key]: open }));
  }, []);

  /** Closes every given group in one action (VS Code "Collapse Folders"). */
  const collapseAll = useCallback((keys: string[]) => {
    setOpenGroups((prev) => {
      const next: OpenGroups = { ...prev };
      for (const key of keys) next[key] = false;
      return next;
    });
  }, []);

  return { openGroups, toggleGroup, collapseAll };
}
