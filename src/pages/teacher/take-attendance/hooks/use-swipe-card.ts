import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { TAttendanceStatus } from "../attendance-status";

export const SWIPE_COMMIT_DISTANCE = 90;
const FLY_OUT_MS = 200;
const STAMP_MIN_DISTANCE = 12;

export type TSwipeDirection = "right" | "left" | "up" | "down";

export const SWIPE_DIRECTION_STATUS: Record<
  TSwipeDirection,
  TAttendanceStatus
> = {
  right: "PRESENT",
  left: "ABSENT",
  up: "LEAVE",
  down: "LATE",
};

const FLY_OUT_VECTOR: Record<TSwipeDirection, { x: number; y: number }> = {
  right: { x: 480, y: 0 },
  left: { x: -480, y: 0 },
  up: { x: 0, y: -480 },
  down: { x: 0, y: 480 },
};

const KEY_DIRECTIONS: Record<string, TSwipeDirection> = {
  ArrowRight: "right",
  ArrowLeft: "left",
  ArrowUp: "up",
  ArrowDown: "down",
};

export type TOffset = { x: number; y: number };

/** Dominant drag direction, or null while the pointer is near the origin. */
export function swipeDirection(offset: TOffset): TSwipeDirection | null {
  if (Math.max(Math.abs(offset.x), Math.abs(offset.y)) < STAMP_MIN_DISTANCE)
    return null;
  if (Math.abs(offset.x) >= Math.abs(offset.y))
    return offset.x >= 0 ? "right" : "left";
  return offset.y >= 0 ? "down" : "up";
}

export function swipeDistance(offset: TOffset): number {
  return Math.max(Math.abs(offset.x), Math.abs(offset.y));
}

export function useSwipeCard(options: {
  onCommit: (status: TAttendanceStatus) => void;
  disabled?: boolean;
  reducedMotion?: boolean;
}) {
  const { onCommit, disabled = false, reducedMotion = false } = options;
  const [offset, setOffset] = useState<TOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState<TSwipeDirection | null>(null);

  const offsetRef = useRef<TOffset>({ x: 0, y: 0 });
  const startRef = useRef<TOffset>({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const updateOffset = useCallback((next: TOffset) => {
    offsetRef.current = next;
    setOffset(next);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const commit = useCallback(
    (direction: TSwipeDirection) => {
      if (disabled || exiting) return;
      const status = SWIPE_DIRECTION_STATUS[direction];
      if (reducedMotion) {
        updateOffset({ x: 0, y: 0 });
        onCommit(status);
        return;
      }
      setExiting(direction);
      updateOffset(FLY_OUT_VECTOR[direction]);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setExiting(null);
        updateOffset({ x: 0, y: 0 });
        onCommit(status);
      }, FLY_OUT_MS);
    },
    [disabled, exiting, onCommit, reducedMotion, updateOffset],
  );

  const finishDrag = useCallback(() => {
    setIsDragging(false);
    pointerIdRef.current = null;
    const direction = swipeDirection(offsetRef.current);
    if (
      direction &&
      swipeDistance(offsetRef.current) >= SWIPE_COMMIT_DISTANCE
    ) {
      commit(direction);
      return;
    }
    updateOffset({ x: 0, y: 0 });
  }, [commit, updateOffset]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || exiting) return;
    pointerIdRef.current = event.pointerId;
    startRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;
    updateOffset({
      x: event.clientX - startRef.current.x,
      y: event.clientY - startRef.current.y,
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    finishDrag();
  };

  // A cancelled touch (scroll gesture, OS interruption) must never commit.
  const onPointerCancel = () => {
    setIsDragging(false);
    pointerIdRef.current = null;
    updateOffset({ x: 0, y: 0 });
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction || disabled) return;
    event.preventDefault();
    commit(direction);
  };

  return {
    offset,
    isDragging,
    exiting,
    direction: swipeDirection(offset),
    distance: swipeDistance(offset),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
    },
  };
}

export type TSwipeCard = ReturnType<typeof useSwipeCard>;
