import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PenSquare } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import { ActiveStatusBadge } from "@/components/ui/status-badge";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useCan } from "@/auth/use-can";
import {
  deleteScholarship,
  listScholarships,
  type T_SCHOLARSHIP,
} from "./service/service";
import ScholarshipFormDialog from "./dialog/scholarship-form-dialog";

const LIMIT = 20;

function money(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

/**
 * Scholarship schemes: the accountant defines the schemes (percent/fixed
 * amount) and grants them to students via the "Granted Scholarships" page.
 */
export default function AccountantScholarshipsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T_SCHOLARSHIP | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const canManage = useCan("scholarship:manage");

  const schemesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIPS, page, search],
    queryFn: () => listScholarships({ page, limit: LIMIT, search }),
  });

  const schemeHead: T_TableHead<T_SCHOLARSHIP>[] = [
    { key: "name", headName: "Name", minWidth: 220 },
    { key: "code", headName: "Code", minWidth: 140, render: (s) => s.code ?? "—" },
    {
      key: "type",
      headName: "Type",
      minWidth: 160,
      render: (s) => (
        <Badge variant="secondary">
          {s.type === "PERCENT" ? `${money(s.value)}%` : `NPR ${money(s.value)}`}
        </Badge>
      ),
    },
    {
      key: "description",
      headName: "Description",
      minWidth: 260,
      render: (s) => s.description ?? "—",
    },
    {
      key: "isActive",
      headName: "Status",
      minWidth: 120,
      render: (s) => <ActiveStatusBadge active={s.isActive} />,
    },
  ];

  if (schemesQuery.isLoading) return <ScreenLoader />;
  if (schemesQuery.isError) return <AlertHandler variant="error" />;

  const schemeRows: T_SCHOLARSHIP[] = Array.isArray(
    schemesQuery.data?.data?.data,
  )
    ? schemesQuery.data.data.data
    : Array.isArray(schemesQuery.data?.data)
      ? schemesQuery.data.data
      : [];

  const total =
    schemesQuery.data?.data?.pagination?.total ?? schemeRows.length;

  return (
    <div className="p-5">
      <PageHeader
        title="Scholarship Schemes"
        description="Define scholarship schemes (percent or fixed amount) that can be granted to students via the Granted Scholarships page."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Scholarship Schemes", link: "/accountant/scholarships" },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {canManage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            New Scholarship Scheme
          </Button>
        ) : null}
        {canManage ? (
          <Button size="sm" asChild>
            <a href="/accountant/scholarships/grants">Grant Scholarship</a>
          </Button>
        ) : null}
      </div>

      <GenericTable
        tableHeads={schemeHead}
        data={schemeRows}
        onDelete={canManage ? (scheme) => setDeleteId(scheme.id) : undefined}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search scholarships..."
        emptyTitle="No scholarship schemes yet."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderActions={
          canManage
            ? (scheme) => (
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(scheme);
                    setFormOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
                >
                  <PenSquare className="h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              )
            : undefined
        }
      />

      {formOpen ? (
        <ScholarshipFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          scholarship={editing}
        />
      ) : null}

      {deleteId ? (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Scholarship"
          onDelete={deleteScholarship}
        />
      ) : null}
    </div>
  );
}
