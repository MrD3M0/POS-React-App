import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createHoliday, deleteHoliday, generateWeeklyOffs, listHolidays, type T_HOLIDAY } from "./service/service";

const LIMIT = 15;

export default function AdminHolidaysPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP, "holidays", search, page],
    queryFn: () => listHolidays({ page, limit: LIMIT, search: search || undefined }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_LOOKUP, "holidays"] });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

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
            } catch (e: any) {
              toast.error(e?.response?.data?.message || "Failed");
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
      />
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
            } catch (e: any) {
              toast.error(e?.response?.data?.message || "Failed");
            }
          }}
        >
          Add holiday
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const year = window.prompt("BS year for Saturdays (e.g. 2082):");
            if (!year) return;
            try {
              const res = await generateWeeklyOffs(Number(year));
              toast.success(`Created ${res?.data?.created ?? 0} weekly off days`);
              refresh();
            } catch (e: any) {
              toast.error(e?.response?.data?.message || "Failed");
            }
          }}
        >
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
    </div>
  );
}
