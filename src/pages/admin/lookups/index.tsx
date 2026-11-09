import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listLookups, deleteLookup, type T_LOOKUP } from "./service/service";

const LIMIT = 10;
const SECTIONS = [
  { label: "Leave Types", type: "leaveType", queryKey: QUERY_KEYS.ADMIN_LOOKUP_LEAVE },
  { label: "Periods", type: "period", queryKey: QUERY_KEYS.ADMIN_LOOKUP_PERIOD },
  { label: "Exam Types", type: "examType", queryKey: QUERY_KEYS.ADMIN_LOOKUP_EXAM },
  { label: "Grade Scales", type: "gradeScale", queryKey: QUERY_KEYS.ADMIN_LOOKUP_GRADE },
  { label: "Fee Heads", type: "feeHead", queryKey: QUERY_KEYS.ADMIN_LOOKUP_FEEHEAD },
  { label: "Payment Methods", type: "paymentMethod", queryKey: QUERY_KEYS.ADMIN_LOOKUP_METHOD },
  { label: "Salary Components", type: "salaryComponent", queryKey: QUERY_KEYS.ADMIN_LOOKUP_COMPONENT },
  { label: "Chart Accounts", type: "chartAccount", queryKey: QUERY_KEYS.ADMIN_LOOKUP_ACCOUNT },
] as const;

export default function AdminLookupsPage() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const active = SECTIONS[tab] ?? SECTIONS[0];

  const query = useQuery({
    queryKey: [active.queryKey, active.type, search, page],
    queryFn: () => listLookups({ type: active.type, page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_LOOKUP[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_LOOKUP>[] = [
    {
      key: "code",
      headName: active.type === "period" ? "Period #" : active.type === "gradeScale" ? "Grade" : "Code",
      render: (l) => l.code ?? (l.periodNumber ? `#${l.periodNumber}` : l.grade ?? "—"),
    },
    { key: "name", headName: "Name", render: (l) => l.name ?? (l.grade ? `Grade ${l.grade}` : "—") },
    {
      key: "isActive",
      headName: "Status",
      render: (l) => {
        const activeVal = l.isActive ?? l.active ?? true;
        return (
          <Badge variant={activeVal ? "default" : "destructive"}>
            {activeVal ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Lookups"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Lookups", link: "/admin/lookups" }]}
        actions={
          <Link to={`/admin/lookups/create?type=${active.type}`}>
            <Button variant="primary" size="sm">
              New {active.label.replace(/s$/, "")}
            </Button>
          </Link>
        }
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {SECTIONS.map((s, i) => (
          <button
            key={s.type}
            onClick={() => {
              setTab(i);
              setPage(1);
              setSearch("");
            }}
            className={`rounded px-3 py-1 text-sm font-medium ${
              tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onDelete={(l) => setDeleteId(l.id)}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        emptyTitle={`No ${active.label.toLowerCase()} found.`}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder={`Search ${active.label.toLowerCase()}...`}
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          itemName={active.label.replace(/s$/, "")}
          onDelete={(id) => deleteLookup(active.type, id)}
        />
      )}
    </div>
  );
}
