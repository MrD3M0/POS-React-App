import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Undo2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import StatusBadge from "@/components/ui/status-badge";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useCan } from "@/auth/use-can";
import GrantScholarshipDialog from "../dialog/grant-scholarship-dialog";
import {
  listScholarshipGrants,
  revokeScholarshipGrant,
  type T_SCHOLARSHIP_GRANT,
} from "../service/service";

const LIMIT = 20;

function money(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function studentLabel(grant: T_SCHOLARSHIP_GRANT): string {
  const student = grant.student;
  if (!student) return "—";
  const name = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
  return `${student.universityRegNo ?? ""}${name ? ` — ${name}` : ""}`;
}

/**
 * Granted scholarships: the accountant grants a scheme to a student, the
 * principal may only look.
 */
export default function AccountantScholarshipGrantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [grantOpen, setGrantOpen] = useState(false);
  const qc = useQueryClient();
  const canManage = useCan("scholarship:manage");

  const grantsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIP_GRANTS, page, search],
    queryFn: () => listScholarshipGrants({ page, limit: LIMIT, search }),
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => revokeScholarshipGrant(id),
    onSuccess: () => {
      toast.success("Scholarship revoked.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIP_GRANTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
    },
    onError: () => toast.error("Failed to revoke the scholarship."),
  });

  const grantHead: T_TableHead<T_SCHOLARSHIP_GRANT>[] = [
    {
      key: "scholarship",
      headName: "Scholarship",
      minWidth: 220,
      render: (g) => g.scholarship?.name ?? "—",
    },
    {
      key: "student",
      headName: "Student",
      minWidth: 240,
      render: (g) => studentLabel(g),
    },
    {
      key: "item",
      headName: "Fee Item",
      minWidth: 180,
      render: (g) => g.studentFeeItem?.feeHead?.name ?? "—",
    },
    {
      key: "amount",
      headName: "Amount",
      minWidth: 140,
      render: (g) => `NPR ${money(g.amount)}`,
    },
    {
      key: "note",
      headName: "Note",
      minWidth: 200,
      render: (g) => g.note ?? "—",
    },
    {
      key: "status",
      headName: "Status",
      minWidth: 130,
      render: (g) =>
        g.revokedAt ? (
          <StatusBadge status="REVOKED" />
        ) : (
          <StatusBadge status="ACTIVE" />
        ),
    },
  ];

  const active = grantsQuery;
  if (active.isLoading) return <ScreenLoader />;
  if (active.isError) return <AlertHandler variant="error" />;

  const grantRows: T_SCHOLARSHIP_GRANT[] = Array.isArray(
    grantsQuery.data?.data?.data,
  )
    ? grantsQuery.data.data.data
    : Array.isArray(grantsQuery.data?.data)
      ? grantsQuery.data.data
      : [];

  const total =
    grantsQuery.data?.data?.pagination?.total ?? grantRows.length;

  return (
    <div className="p-5">
      <PageHeader
        title="Granted Scholarships"
        description="Scholarships granted to students; the discount lands on the student's fee items."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Scholarships", link: "/accountant/scholarships" },
          { title: "Granted", link: "/accountant/scholarships/grants" },
        ]}
        backPage="/accountant/scholarships"
        actions={
          canManage ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setGrantOpen(true)}
            >
              <Plus className="size-3.5" />
              Grant Scholarship
            </Button>
          ) : undefined
        }
      />

      <GenericTable
        tableHeads={grantHead}
        data={grantRows}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search grants..."
        emptyTitle="No scholarship granted yet."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderActions={
          canManage
            ? (grant) => (
                <DropdownMenuItem
                  disabled={revokeMut.isPending || Boolean(grant.revokedAt)}
                  onClick={() => revokeMut.mutate(grant.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
                >
                  <Undo2 className="h-4 w-4" />
                  <span>Revoke</span>
                </DropdownMenuItem>
              )
            : undefined
        }
      />
      {grantOpen ? (
        <GrantScholarshipDialog open={grantOpen} onOpenChange={setGrantOpen} />
      ) : null}
    </div>
  );
}
