import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PenSquare, UserPlus, Users } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import { ActiveStatusBadge } from "@/components/ui/status-badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  deleteFeeStructure,
  listFeeStructures,
  type T_FEE_STRUCTURE,
} from "./service/service";
import AssignFeeStructureDialog from "./dialog/assign-fee-structure-dialog";

const LIMIT = 20;

function money(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function itemsLabel(structure: T_FEE_STRUCTURE): string {
  const items = structure.items ?? [];
  if (items.length === 0) return "No fee items";
  return items
    .map((item) => {
      const head = item.feeHead?.name ?? item.feeHeadId;
      const term = item.termNumber ? ` (term ${item.termNumber})` : " (one time)";
      return `${head} ${money(item.amount)}${term}`;
    })
    .join(", ");
}

/** Short label for the table cell: first two items, then "+N more". */
function itemsLabelShort(structure: T_FEE_STRUCTURE): string {
  const items = structure.items ?? [];
  if (items.length === 0) return "No fee items";
  const first = items.slice(0, 2).map((item) => {
    const head = item.feeHead?.name ?? item.feeHeadId;
    const term = item.termNumber ? ` (term ${item.termNumber})` : " (one time)";
    return `${head} ${money(item.amount)}${term}`;
  });
  const rest = items.length - first.length;
  return `${first.join(", ")}${rest > 0 ? ` +${rest} more` : ""}`;
}

function totalLabel(structure: T_FEE_STRUCTURE): string {
  const total = (structure.items ?? []).reduce(
    (sum, item) => sum + Number(item.amount ?? 0),
    0,
  );
  return `NPR ${money(total)}`;
}

/**
 * Fee structures: the accountant defines what a class costs and assigns it to
 * students (one student or a whole batch).
 */
export default function AccountantFeeStructuresPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<T_FEE_STRUCTURE | null>(null);
  const [assignMode, setAssignMode] = useState<"student" | "batch">("student");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE, page, search],
    queryFn: () => listFeeStructures({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_FEE_STRUCTURE[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_FEE_STRUCTURE>[] = [
    {
      key: "name",
      headName: "Structure",
      minWidth: 180,
      render: (structure) => structure.name ?? "—",
    },
    {
      key: "course",
      headName: "Course",
      minWidth: 170,
      render: (structure) => structure.course?.name ?? structure.courseId ?? "—",
    },
    {
      key: "batch",
      headName: "Applies to",
      minWidth: 130,
      render: (structure) =>
        structure.batch?.name ? (
          <Badge variant="secondary">Batch {structure.batch.name}</Badge>
        ) : (
          <Badge variant="outline">Whole course</Badge>
        ),
    },
    {
      key: "items",
      headName: "Fee Items",
      minWidth: 260,
      render: (structure) => (
        <span className="block truncate text-sm" title={itemsLabel(structure)}>
          {itemsLabelShort(structure)}
        </span>
      ),
    },
    {
      key: "total",
      headName: "Total",
      minWidth: 120,
      render: (structure) => totalLabel(structure),
    },
    {
      key: "isActive",
      headName: "Status",
      minWidth: 100,
      render: (structure) => <ActiveStatusBadge active={structure.isActive} />,
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Fee Structures"
        description="What a class costs, and assigning it to students."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/fee-structures" },
          { title: "Fee Structures", link: "/accountant/fee-structures" },
        ]}
        createPage="/accountant/fee-structures/create"
        createPageTitle="Create"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onDelete={(structure) => setDeleteId(structure.id)}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search fee structures..."
        emptyTitle="No fee structures yet."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderActions={(structure) => (
          <>
            <DropdownMenuItem
              onClick={() => navigate(`/accountant/fee-structures/${structure.id}/edit`)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
            >
              <PenSquare className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setAssignTarget(structure);
                setAssignMode("student");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Assign Student</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setAssignTarget(structure);
                setAssignMode("batch");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Assign Batch</span>
            </DropdownMenuItem>
          </>
        )}
      />

      {assignTarget ? (
        <AssignFeeStructureDialog
          open
          onOpenChange={(open) => !open && setAssignTarget(null)}
          structure={assignTarget}
          mode={assignMode}
        />
      ) : null}

      {deleteId ? (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Fee structure"
          onDelete={deleteFeeStructure}
        />
      ) : null}
    </div>
  );
}
