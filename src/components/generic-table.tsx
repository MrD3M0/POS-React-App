import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  EllipsisVerticalIcon,
  PenSquare,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { useDebounce } from "use-debounce";
import { cn, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Button from "@/components/ui/button";
import NoData from "./common/no-data";
import StatusBadge from "./ui/status-badge";
import PaginationControls from "./common/PaginationControls";

export type T_TableHead<T = unknown> = {
  key: string;
  headName: string;
  minWidth?: number;
  render?: (item: T, index: number) => ReactNode;
};

export type T_TablePagination = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

type Props<T extends Record<string, unknown>> = {
  tableHeads: T_TableHead<T>[];
  data: T[];
  renderRow?: (item: T, index: number) => Record<string, ReactNode>;
  onEdit?: (item: T) => string;
  onDelete?: (item: T) => void;
  /** Extra actions — these will NOT show directly, only inside EllipsisVertical Popover */
  renderActions?: (item: T, index: number) => ReactNode;
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  pagination?: T_TablePagination;
  emptyTitle?: string;
  emptyDescription?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;
const isDateValue = (value: unknown): value is string =>
  typeof value === "string" && ISO_DATE.test(value);

const getValue = (item: Record<string, unknown>, path: string): unknown => {
  const direct =
    path in item
      ? item[path]
      : path
          .split(".")
          .reduce<unknown>(
            (acc, part) =>
              acc != null && typeof acc === "object"
                ? (acc as Record<string, unknown>)[part]
                : undefined,
            item,
          );
  if (direct !== undefined && direct !== null && direct !== "") return direct;
  if (path === "role")
    return (
      (item.user as Record<string, unknown> | undefined)?.role ??
      item.userRole ??
      direct
    );
  if (path === "email")
    return (
      (item.user as Record<string, unknown> | undefined)?.email ??
      item.userEmail ??
      direct
    );
  return direct;
};

const LABEL_KEYS = ["name", "title", "label"];

const toDisplayValue = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value
      .map(toDisplayValue)
      .filter((v) => v !== null && v !== undefined && v !== "")
      .join(", ");
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const k of LABEL_KEYS) {
      const v = obj[k];
      if (typeof v === "string" || typeof v === "number") return v;
    }
    return "";
  }
  return value;
};

const stringify = (value: unknown) => {
  const v = toDisplayValue(value);
  if (typeof v === "boolean") return v ? "active" : "inactive";
  if (v === null || v === undefined) return "";
  return String(v).toLowerCase();
};

const renderValue = (raw: unknown): ReactNode => {
  const value = toDisplayValue(raw);
  if (typeof value === "boolean")
    return (
      <StatusBadge variant={value ? "success" : "outline"}>
        {value ? "active" : "inactive"}
      </StatusBadge>
    );
  if (isDateValue(value))
    return (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(value)}
      </span>
    );
  if (value === null || value === undefined || value === "")
    return <span className="text-muted-foreground">—</span>;
  return <span className="text-foreground/90">{String(value)}</span>;
};

/* -------------------------------------------------- */
/*  EllipsisVertical + Popover for extra actions       */
/*  Only this shows when renderActions exists          */
/* -------------------------------------------------- */
function RowActionsPopover({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={4}
        className="w-52 p-1.5"
        // Clicking any action inside closes the popover
        onClickCapture={() => setOpen(false)}
      >
        {/* 
          Whatever you return from renderActions() will be stacked vertically here.
          Style your actions like this for best look:
          <Button variant="ghost" className="w-full justify-start">View</Button>
          <Link className="flex h-8 items-center rounded-md px-2 text-sm hover:bg-muted">Details</Link>
        */}
        <div className="flex flex-col gap-0.5 [&_a]:flex [&_a]:h-8 [&_a]:items-center [&_a]:rounded-md [&_a]:px-2 [&_a]:text-sm [&_a]:hover:bg-muted [&_button]:w-full [&_button]:justify-start [&_button]:font-normal">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const GenericTable = <T extends Record<string, unknown>>({
  tableHeads,
  data,
  renderRow,
  onEdit,
  onDelete,
  renderActions,
  isLoading = false,
  onSearch,
  searchPlaceholder = "Search…",
  pagination,
  emptyTitle,
  emptyDescription,
}: Props<T>) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);

  const lastSent = useRef("");
  useEffect(() => {
    if (!onSearch || debouncedSearch === lastSent.current) return;
    lastSent.current = debouncedSearch;
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const rows = useMemo(() => {
    if (onSearch) return data;
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      tableHeads.some((head) =>
        stringify(getValue(item, head.key)).includes(q),
      ),
    );
  }, [data, search, onSearch, tableHeads]);

  const hasActions = !!onEdit || !!onDelete || !!renderActions;
  const colCount = tableHeads.length + 1 + (hasActions ? 1 : 0);

  const startIndex = pagination ? (pagination.page - 1) * pagination.limit : 0;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limit))
    : 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Search */}
      <div className="relative min-w-48 max-w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search table"
          className={cn(
            "h-8 w-full rounded-md pl-8 pr-8 text-sm",
            "border border-border bg-background",
            "text-foreground placeholder:text-muted-foreground",
            "focus:border-ring/60 focus:outline-none focus:ring-2 focus:ring-ring/40",
            "transition-colors",
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <div className="flex !min-h-[25rem] flex-1 flex-col overflow-hidden rounded-lg border border-border">
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <div className="shrink-0 [&>div]:overflow-visible">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12 min-w-12 border-r text-center text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    SN
                  </TableHead>
                  {tableHeads.map((head) => (
                    <TableHead
                      key={head.key}
                      style={{ minWidth: head.minWidth }}
                      className="border-r text-xs font-semibold uppercase tracking-wide text-foreground/70"
                    >
                      {head.headName}
                    </TableHead>
                  ))}
                  {hasActions && (
                    <TableHead className="w-32 text-center text-xs font-semibold uppercase tracking-wide text-foreground/70">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="animate-pulse hover:bg-transparent"
                    >
                      {Array.from({ length: colCount }).map((_, j) => (
                        <TableCell key={j}>
                          <div
                            className="h-4 rounded bg-muted"
                            style={{ width: `${55 + ((j * 37) % 35)}%` }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!isLoading &&
                  rows.map((item, index) => {
                    const cells = renderRow?.(item, startIndex + index);
                    return (
                      <TableRow
                        key={
                          item.id != null && typeof item.id !== "object"
                            ? (item.id as string | number)
                            : index
                        }
                        className="group transition-colors"
                      >
                        <TableCell className="w-12 min-w-12 border-b border-r text-center text-sm tabular-nums text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>

                        {tableHeads.map((head) => {
                          const custom = cells?.[head.key];
                          return (
                            <TableCell
                              key={head.key}
                              style={{ minWidth: head.minWidth }}
                              className="max-w-[20rem] truncate border-b border-r text-sm"
                            >
                              {custom !== undefined
                                ? custom
                                : head.render
                                  ? head.render(item, startIndex + index)
                                  : renderValue(getValue(item, head.key))}
                            </TableCell>
                          );
                        })}

                        {hasActions && (
                          <TableCell className="w-32 min-w-32 border-b text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              {/* 1. EDIT — always direct */}
                              {onEdit && (
                                <Link
                                  to={onEdit(item)}
                                  aria-label={`Edit row ${startIndex + index + 1}`}
                                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                >
                                  <PenSquare className="size-3.5" />
                                </Link>
                              )}

                              {/* 2. DELETE — always direct */}
                              {onDelete && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Delete row ${startIndex + index + 1}`}
                                  className="size-7 text-destructive hover:text-destructive"
                                  onClick={() => onDelete(item)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}

                              {/* 3. EVERYTHING ELSE — inside EllipsisVertical Popover */}
                              {renderActions && (
                                <RowActionsPopover
                                  label={`More actions for row ${startIndex + index + 1}`}
                                >
                                  {renderActions(item, startIndex + index)}
                                </RowActionsPopover>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {!isLoading && rows.length === 0 && (
            <NoData title={emptyTitle} description={emptyDescription} />
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <div className="flex shrink-0 items-center justify-between border-t border-border px-4 pb-3 pt-0">
            <p className="pt-4 text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages} &nbsp;·&nbsp;{" "}
              {pagination.total} total
            </p>
            <PaginationControls
              currentPage={pagination.page}
              lastPage={totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericTable;
