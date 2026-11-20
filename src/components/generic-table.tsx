import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
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
    return <StatusBadge status={value ? "ACTIVE" : "INACTIVE"} />;
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

/* ---------------------------------------------------------------- */
/*  EllipsisVertical dropdown for extra row actions                  */
/*  Pages render <DropdownMenuItem> (icon + label) children —        */
/*  stacked vertically, one action per row.                          */
/* ---------------------------------------------------------------- */
function RowActionsPopover({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      {/* Vertical column: one item per row */}
      <DropdownMenuContent
        align="end"
        className="flex flex-col min-w-[180px] p-1"
        // Clicking any action inside closes the menu
        onClickCapture={() => setOpen(false)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------------------------------------------------------- */
/*  Round arrow button used for mobile prev / next page              */
/* ---------------------------------------------------------------- */
function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className="size-8 shrink-0 self-center rounded-full shadow-sm active:scale-95 disabled:opacity-30"
    >
      <Icon className="size-4" />
    </Button>
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

  const canPrev = !!pagination && pagination.page > 1;
  const canNext = !!pagination && pagination.page < totalPages;

  const goToPage = (page: number) => {
    if (!pagination) return;
    const next = Math.min(Math.max(1, page), totalPages);
    if (next !== pagination.page) pagination.onPageChange(next);
  };

  // Mobile card list: jump back to the top whenever the page changes
  const cardScrollRef = useRef<HTMLDivElement>(null);
  const currentPage = pagination?.page;
  useEffect(() => {
    cardScrollRef.current
      ?.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const renderCell = (
    item: T,
    index: number,
    head: T_TableHead<T>,
    cells?: Record<string, ReactNode>,
  ): ReactNode => {
    const custom = cells?.[head.key];
    if (custom !== undefined) return custom;
    if (head.render) return head.render(item, index);
    return renderValue(getValue(item, head.key));
  };

  const getRowKey = (item: T, index: number) =>
    item.id != null && typeof item.id !== "object"
      ? (item.id as string | number)
      : index;

  /** Edit / Delete / ⋮ — shared by the table row and the mobile card */
  const renderRowActions = (item: T, index: number) => (
    <div className="flex items-center justify-end gap-0.5">
      {/* 1. EDIT — always direct */}
      {onEdit && (
        <Link
          to={onEdit(item)}
          aria-label={`Edit row ${index + 1}`}
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
          aria-label={`Delete row ${index + 1}`}
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}

      {/* 3. EVERYTHING ELSE — inside EllipsisVertical Popover */}
      {renderActions && (
        <RowActionsPopover label={`More actions for row ${index + 1}`}>
          {renderActions(item, index)}
        </RowActionsPopover>
      )}
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Top bar: Search (left) + Pagination control (right) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-full min-w-48 sm:w-72">
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

        {/* Mobile only — desktop already has the pagination footer */}
        {pagination && pagination.total > 0 && (
          <div className="ml-auto flex items-center md:hidden">
            <PaginationControls
              currentPage={pagination.page}
              lastPage={totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  MOBILE — scrollable cards + left/right arrows (< md)        */}
      {/* ============================================================ */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 md:hidden">
        <div className="flex min-h-0 flex-1 items-stretch gap-2">
          {pagination && (
            <ArrowButton
              direction="prev"
              disabled={!canPrev || isLoading}
              onClick={() => goToPage(pagination.page - 1)}
            />
          )}

          <ScrollArea
            ref={cardScrollRef}
            className="h-[65vh] min-h-[20rem] min-w-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block"
          >
            <div className="space-y-3 pb-1 pr-3">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="gap-0 py-0 shadow-sm">
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 p-3">
                      {Array.from({
                        length: Math.min(tableHeads.length, 4),
                      }).map((_, j) => (
                        <div key={j} className="space-y-1.5">
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton
                            className="h-4"
                            style={{ width: `${55 + ((j * 23) % 40)}%` }}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}

              {!isLoading &&
                rows.map((item, index) => {
                  const globalIndex = startIndex + index;
                  const cells = renderRow?.(item, globalIndex);
                  return (
                    <Card
                      key={getRowKey(item, index)}
                      className="gap-0 py-0 shadow-sm"
                    >
                      {/* Card header: SN + actions */}
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
                        <Badge
                          variant="secondary"
                          className="tabular-nums text-muted-foreground"
                        >
                          #{globalIndex + 1}
                        </Badge>
                        {hasActions && renderRowActions(item, globalIndex)}
                      </CardHeader>
                      <Separator />

                      {/* Card body: 2-column grid, label on top, value below */}
                      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 p-3">
                        {tableHeads.map((head) => (
                          <div key={head.key} className="min-w-0 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              {head.headName}
                            </p>
                            <div className="break-words text-sm">
                              {renderCell(item, globalIndex, head, cells)}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}

              {!isLoading && rows.length === 0 && (
                <NoData title={emptyTitle} description={emptyDescription} />
              )}
            </div>
          </ScrollArea>

          {pagination && (
            <ArrowButton
              direction="next"
              disabled={!canNext || isLoading}
              onClick={() => goToPage(pagination.page + 1)}
            />
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Page {pagination.page} of {totalPages} &nbsp;·&nbsp;{" "}
            {pagination.total} total
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/*  DESKTOP — original table (>= md)                            */}
      {/* ============================================================ */}
      <div className="hidden !min-h-[25rem] flex-1 flex-col overflow-hidden rounded-lg border border-border md:flex">
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
                    const globalIndex = startIndex + index;
                    const cells = renderRow?.(item, globalIndex);
                    return (
                      <TableRow
                        key={getRowKey(item, index)}
                        className="group transition-colors"
                      >
                        <TableCell className="w-12 min-w-12 border-b border-r text-center text-sm tabular-nums text-muted-foreground">
                          {globalIndex + 1}
                        </TableCell>

                        {tableHeads.map((head) => (
                          <TableCell
                            key={head.key}
                            style={{ minWidth: head.minWidth }}
                            className="max-w-[20rem] truncate border-b border-r text-sm"
                          >
                            {renderCell(item, globalIndex, head, cells)}
                          </TableCell>
                        ))}

                        {hasActions && (
                          <TableCell className="w-32 min-w-32 border-b text-right">
                            {renderRowActions(item, globalIndex)}
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
