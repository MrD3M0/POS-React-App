import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { CalendarDays, Table2 } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Input from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { BsDatePicker } from "@/components/bs-datepicker";
import BsEventCalendar from "@/components/calendar/bs-event-calendar";
import { useCalendarEvents } from "@/components/calendar/use-calendar-events";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import type { T_UseQueryError } from "@/types/common";
import { formatBs, todayBs } from "@/lib/bs-date";
import {
  createHoliday,
  deleteHoliday,
  generateWeeklyOffs,
  listHolidays,
  type T_HOLIDAY,
} from "./service/service";
import { holidayFormSchema, type HolidayFormValues } from "./schema/schema";

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
  const [createDateBs, setCreateDateBs] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleGenerateWeeklyOffs = async () => {
    const year = window.prompt("BS year for Saturdays (e.g. 2082):");
    if (!year) return;
    try {
      const res = await generateWeeklyOffs(Number(year));
      toast.success(`Created ${res?.data?.created ?? 0} weekly off days`);
      refresh();
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ||
        "Failed";
      toast.error(message);
    }
  };

  if (query.isLoading && view === "table") return <ScreenLoader />;
  if (query.isError && view === "table") return <AlertHandler variant="error" />;

  const rows: T_HOLIDAY[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_HOLIDAY>[] = [
    { key: "dateBs", headName: "Date (BS)", minWidth: 140 },
    { key: "name", headName: "Name", minWidth: 220 },
    {
      key: "applies",
      headName: "Applies to",
      minWidth: 220,
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
      minWidth: 140,
      render: (r) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={async () => {
            if (!window.confirm(`Delete holiday ${r.name} (${r.dateBs})?`)) return;
            try {
              await deleteHoliday(r.id);
              toast.success("Holiday deleted");
              refresh();
            } catch (error) {
              const message =
                (error as AxiosError<{ message?: string }>).response?.data?.message ||
                "Failed";
              toast.error(message);
            }
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Holidays"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Holidays", link: "/admin/holidays" }]}
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
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              onClick={async () => {
                const dateBs = window.prompt("Holiday date (BS YYYY-MM-DD):");
                const name = window.prompt("Holiday name:");
                if (!dateBs || !name) return;
                try {
                  await createHoliday({ dateBs, name, appliesToEmployees: true, appliesToStudents: true });
                  toast.success("Holiday created");
                  refresh();
                } catch (error) {
                  const message =
                    (error as AxiosError<{ message?: string }>).response?.data?.message ||
                    "Failed";
                  toast.error(message);
                }
              }}
            >
              Add holiday
            </Button>
            <Button variant="outline" onClick={handleGenerateWeeklyOffs}>
              Generate Saturdays
            </Button>
          </div>
          <GenericTable
            tableHeads={head}
            data={rows}
            onSearch={(value) => { setSearch(value); setPage(1); }}
            emptyTitle="No holidays found."
            pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
            searchPlaceholder="Search holidays..."
          />
        </>
      ) : (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button variant="outline" onClick={handleGenerateWeeklyOffs}>
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
              onDayClick={(dateBs) => setCreateDateBs(dateBs)}
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

      <CreateHolidayDialog
        open={createDateBs !== null}
        dateBs={createDateBs ?? formatBs(today)}
        onOpenChange={(open) => !open && setCreateDateBs(null)}
        onCreated={refresh}
      />

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        itemId={deleteId ?? ""}
        itemName="holiday"
        onDelete={deleteHoliday}
        onSuccess={() => {
          toast.success("Holiday deleted");
          refresh();
        }}
      />
    </div>
  );
}

// ─── Create holiday dialog (opened from the calendar) ────────────────────────

function CreateHolidayDialog({
  open,
  dateBs,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  dateBs: string;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      dateBs,
      name: "",
      appliesToEmployees: true,
      appliesToStudents: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ dateBs, name: "", appliesToEmployees: true, appliesToStudents: true });
    }
  }, [open, dateBs, form]);

  const createMutation = useMutation({
    mutationFn: (values: HolidayFormValues) =>
      createHoliday({
        dateBs: values.dateBs,
        name: values.name,
        appliesToEmployees: values.appliesToEmployees,
        appliesToStudents: values.appliesToStudents,
      }),
    onSuccess: () => {
      toast.success("Holiday created");
      onCreated();
      onOpenChange(false);
    },
    onError: (error) => {
      mapFieldsOnError(error as AxiosError<T_UseQueryError>, form.setError);
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ||
        "Failed to create holiday.";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add holiday</DialogTitle>
          <DialogDescription>
            Create a holiday on the selected BS date.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="dateBs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date (BS)</FormLabel>
                  <FormControl>
                    <BsDatePicker
                      value={field.value}
                      onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                      onBlur={field.onBlur}
                      valueFormat="bs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dashain" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-3">
              <FormField
                control={form.control}
                name="appliesToStudents"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 font-normal">Students</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appliesToEmployees"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 font-normal">Employees</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
