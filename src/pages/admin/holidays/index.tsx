import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Table2 } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import BsEventCalendar from "@/components/calendar/bs-event-calendar";
import { useCalendarEvents } from "@/components/calendar/use-calendar-events";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { todayBs } from "@/lib/bs-date";
import { deleteHoliday, listHolidays, type T_HOLIDAY } from "./service/service";
import { HOLIDAY_TYPE_LABELS, type T_HOLIDAY_TYPE_VALUE } from "./schema/schema";
import HolidayForm from "./components/holiday-form";
import GenerateWeekdaysDialog from "./components/generate-weekdays-dialog";

const LIMIT = 15;

export default function AdminHolidaysPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "calendar">("table");

  // Calendar state (BS year/month, today as the starting point)
  const today = todayBs();
  const [calYear, setCalYear] = useState(today.year);
  const [calMonth, setCalMonth] = useState(today.month);

  const [addOpen, setAddOpen] = useState(false);
  const [addInitialDateBs, setAddInitialDateBs] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk row selection ("Delete selected")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_HOLIDAY_LIST, search, page],
    queryFn: () => listHolidays({ page, limit: LIMIT, search: search || undefined }),
  });

  const calendar = useCalendarEvents({
    year: calYear,
    month: calMonth,
    kinds: ["HOLIDAY"],
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_HOLIDAY_LIST] });
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_EVENTS] });
  };

  const openAddDialog = (dateBs: string | null) => {
    setAddInitialDateBs(dateBs);
    setAddOpen(true);
  };

  const closeAddDialog = () => {
    setAddOpen(false);
    setAddInitialDateBs(null);
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const rows: T_HOLIDAY[] = query.data?.data?.data ?? [];
  const pageIds = rows.map((row) => row.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const toggleSelectPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const deleteSelected = async () => {
    setDeletingSelected(true);
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map((id) => deleteHoliday(id)));
    setDeletingSelected(false);
    setDeleteSelectedOpen(false);
    const failed = results.filter((r) => r.status === "rejected").length;
    const deleted = results.length - failed;
    if (deleted > 0) toast.success(`${deleted} holiday${deleted === 1 ? "" : "s"} deleted`);
    if (failed > 0)
      toast.error(`${failed} holiday${failed === 1 ? "" : "s"} could not be deleted`);
    setSelectedIds(new Set());
    refresh();
  };

  if (query.isLoading && view === "table") return <ScreenLoader />;
  if (query.isError && view === "table") return <AlertHandler variant="error" />;

  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_HOLIDAY>[] = [
    {
      key: "select",
      headName: "",
      minWidth: 48,
      render: (r) => (
        <Checkbox
          aria-label={`Select holiday ${r.name} (${r.dateBs})`}
          checked={selectedIds.has(r.id)}
          onCheckedChange={(checked) => toggleSelectRow(r.id, checked === true)}
          className="mx-auto"
        />
      ),
    },
    { key: "dateBs", headName: "Date (BS)", minWidth: 140 },
    { key: "name", headName: "Name", minWidth: 200 },
    {
      key: "type",
      headName: "Type",
      minWidth: 110,
      render: (r) =>
        r.type ? (
          <Badge variant="outline">
            {HOLIDAY_TYPE_LABELS[r.type as T_HOLIDAY_TYPE_VALUE] ?? r.type}
          </Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "applies",
      headName: "Applies to",
      minWidth: 180,
      render: (r) => (
        <div className="flex gap-1">
          {r.appliesToStudents ? <Badge variant="outline">Students</Badge> : null}
          {r.appliesToEmployees ? <Badge variant="outline">Employees</Badge> : null}
        </div>
      ),
    },
    {
      key: "actions",
      headName: "Actions",
      minWidth: 110,
      render: (r) => (
        <Button size="sm" variant="destructive" onClick={() => setDeleteId(r.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Holidays"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Holidays", link: "/admin/holidays" },
        ]}
        actions={
          <Tabs value={view} onValueChange={(value) => setView(value as "table" | "calendar")}>
            <TabsList>
              <TabsTrigger value="table">
                <Table2 />
                Table
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {view === "table" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button onClick={() => openAddDialog(null)}>Add holiday</Button>
            <Button variant="outline" onClick={() => setGenerateOpen(true)}>
              Generate Saturdays
            </Button>
            {rows.length > 0 ? (
              <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={(checked) => toggleSelectPage(checked === true)}
                />
                Select page
              </label>
            ) : null}
            {selectedIds.size > 0 ? (
              <Button variant="destructive" onClick={() => setDeleteSelectedOpen(true)}>
                Delete selected ({selectedIds.size})
              </Button>
            ) : null}
          </div>
          <GenericTable
            tableHeads={head}
            data={rows}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            emptyTitle="No holidays found."
            pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
            searchPlaceholder="Search holidays..."
          />
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setGenerateOpen(true)}>
              Generate Saturdays
            </Button>
            <span className="self-center text-xs text-muted-foreground">
              Click any day to add a holiday. Click an event to view or delete it.
            </span>
          </div>
          {calendar.isError ? (
            <AlertHandler variant="error" />
          ) : (
            <BsEventCalendar
              events={calendar.events}
              year={calYear}
              month={calMonth}
              onMonthChange={(year, month) => {
                setCalYear(year);
                setCalMonth(month);
              }}
              onDayClick={(dateBs) => openAddDialog(dateBs)}
              isLoading={calendar.isLoading}
              renderEventActions={(event, closeDialog) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    closeDialog();
                    setDeleteId(event.id.replace(/^holiday-/, ""));
                  }}
                >
                  Delete
                </Button>
              )}
            />
          )}
        </>
      )}

      {/* Add holiday — single day / date range / multiple dates, all via one bulk request */}
      <Dialog open={addOpen} onOpenChange={(open) => (open ? setAddOpen(true) : closeAddDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add holiday</DialogTitle>
            <DialogDescription>
              One shared name, type and description are applied to every selected date.
              Dates that already have a holiday are skipped.
            </DialogDescription>
          </DialogHeader>
          {/* Mounted fresh per open so the form state resets */}
          {addOpen ? (
            <HolidayForm
              initialDateBs={addInitialDateBs ?? undefined}
              onDone={() => {
                refresh();
                closeAddDialog();
              }}
              onCancel={closeAddDialog}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Generate weekly offs (default Saturdays) */}
      <GenerateWeekdaysDialog open={generateOpen} onOpenChange={setGenerateOpen} onDone={refresh} />

      {/* Single-row delete */}
      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        itemId={deleteId ?? ""}
        itemName="holiday"
        onDelete={deleteHoliday}
        onSuccess={() => {
          toast.success("Holiday deleted");
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (deleteId) next.delete(deleteId);
            return next;
          });
          refresh();
        }}
      />

      {/* Bulk delete confirm */}
      <Dialog open={deleteSelectedOpen} onOpenChange={setDeleteSelectedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete selected holidays?</DialogTitle>
            <DialogDescription>
              {selectedIds.size} holiday{selectedIds.size === 1 ? "" : "s"} will be
              deleted. This action is audited and cannot be undone from this page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteSelectedOpen(false)}
              disabled={deletingSelected}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deletingSelected}
              onClick={() => void deleteSelected()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
