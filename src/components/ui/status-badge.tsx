import type { ReactNode } from "react";
import Badge from "./badge";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared status color system                                                */
/*  Every status badge follows one pattern: light border, dark background,     */
/*  light text. Colors live in badge-variants.ts — add new statuses to        */
/*  STATUS_COLOR_MAP here.                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export type StatusColor = "green" | "yellow" | "red" | "neutral";

type StatusVariant =
  | "status-green"
  | "status-yellow"
  | "status-red"
  | "status-neutral";

const STATUS_VARIANT: Record<StatusColor, StatusVariant> = {
  green: "status-green",
  yellow: "status-yellow",
  red: "status-red",
  neutral: "status-neutral",
};

/**
 * status (case-insensitive) -> color.
 * Anything missing falls back to neutral gray.
 * Keep this as the single source of truth for status → color.
 */
export const STATUS_COLOR_MAP: Record<string, StatusColor> = {
  // Green — positive / done / active
  ACTIVE: "green", APPROVED: "green", PAID: "green", COMPLETED: "green", COMPLETE: "green",
  PRESENT: "green", PUBLISHED: "green", VALID: "green", BALANCED: "green", PASS: "green", CURRENT: "green",
  VERIFIED: "green", TAKEN: "green",
  // Yellow — in progress / attention / pending
  PENDING: "yellow", PARTIAL: "yellow", IN_PROGRESS: "yellow", LATE: "yellow", "LATE DAY": "yellow",
  DRAFT: "yellow", LEAVE: "yellow", LOW: "yellow", WARNING: "yellow",
  // Red — negative / blocked / failed
  INACTIVE: "red", REJECTED: "red", SUSPENDED: "red", CANCELLED: "red", FAILED: "red", BLOCKED: "red",
  LOCKED: "red", UNPAID: "red", OVERDUE: "red", ABSENT: "red", REVOKED: "red", CLOSED: "red",
  "NOT BALANCED": "red", FAIL: "red", CRITICAL: "red",
  // Neutral gray (fallback): GRADUATED, UNVERIFIED, OPEN, TAKEN, anything new.
};

export function resolveStatusColor(status?: string | null): StatusColor {
  const key = (status ?? "").trim().toUpperCase();
  return STATUS_COLOR_MAP[key] ?? "neutral";
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  StatusBadge — the single shared status pill component                    */
/*  Takes a status string (case-insensitive) and returns the pill with       */
/*  the consistent color system.                                             */
/* ────────────────────────────────────────────────────────────────────────── */

export interface StatusBadgeProps {
  /** Status string (case-insensitive). Colors come from STATUS_COLOR_MAP. */
  status?: string | null;
  /** Override label (defaults to the status itself, or "—" if null/undefined). */
  children?: ReactNode;
  /** Extra classes (e.g. margin overrides for custom positions). */
  className?: string;
}

/**
 * Shared status badge: pass any status string (case-insensitive) and get the
 * one consistent color system. Label defaults to the status itself.
 */
export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANT[resolveStatusColor(status)]}
      className={cn("uppercase", className)}
    >
      {children ?? (status ?? "—")}
    </Badge>
  );
}

/** Alias for backwards-compatibility with existing imports. */
export const StatusPill = StatusBadge;

/**
 * Convenience pill for boolean active flags (renders ACTIVE or INACTIVE).
 * Uses the shared StatusBadge color system.
 */
export function ActiveStatusBadge({ active, className }: { active: boolean; className?: string }) {
  return <StatusBadge status={active ? "ACTIVE" : "INACTIVE"} className={className} />;
}
