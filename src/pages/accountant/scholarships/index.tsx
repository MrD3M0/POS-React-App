import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useCan } from "@/auth/permissions";
import {
  deleteScholarship,
  listScholarshipGrants,
  listScholarships,
  revokeScholarshipGrant,
  type T_SCHOLARSHIP,
  type T_SCHOLARSHIP_GRANT,
} from "./service/service";
import ScholarshipFormDialog from "./dialog/scholarship-form-dialog";
import GrantScholarshipDialog from "./dialog/grant-scholarship-dialog";

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
 * Scholarships: the accountant defines the schemes and grants them to
 * students, the principal may only look.
 */
export default function AccountantScholarshipsPage() {
  const [tab, setTab] = useState<"schemes" | "grants">("schemes");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T_SCHOLARSHIP | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();
  const canManage = useCan("scholarship:manage");

  const schemesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIPS, page, search],
    queryFn: () => listScholarships({ page, limit: LIMIT, search }),
    enabled: tab === "schemes",
  });

  const grantsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIP_GRANTS, page, search],
    queryFn: () => listScholarshipGrants({ page, limit: LIMIT, search }),
    enabled: tab === "grants",
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
      render: (s) => (
        <Badge variant={s.isActive ? "default" : "outline"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

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
          <Badge variant="outline">Revoked</Badge>
        ) : (
          <Badge variant="default">Active</Badge>
        ),
    },
  ];

  const active = tab === "schemes" ? schemesQuery : grantsQuery;
  if (active.isLoading) return <ScreenLoader />;
  if (active.isError) return <AlertHandler variant="error" />;

  const schemeRows: T_SCHOLARSHIP[] = Array.isArray(
    schemesQuery.data?.data?.data,
  )
    ? schemesQuery.data.data.data
    : Array.isArray(schemesQuery.data?.data)
      ? schemesQuery.data.data
      : [];
  const grantRows: T_SCHOLARSHIP_GRANT[] = Array.isArray(
    grantsQuery.data?.data?.data,
  )
    ? grantsQuery.data.data.data
    : Array.isArray(grantsQuery.data?.data)
      ? grantsQuery.data.data
      : [];

  const total =
    tab === "schemes"
      ? (schemesQuery.data?.data?.pagination?.total ?? schemeRows.length)
      : (grantsQuery.data?.data?.pagination?.total ?? grantRows.length);

  return (
    <div className="p-5">
      <PageHeader
        title="Scholarships"
        description="Define the scholarship schemes and grant them to students. The discount lands on the student's fee items."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/scholarships" },
          { title: "Scholarships", link: "/accountant/scholarships" },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {(
            [
              ["schemes", "Scholarships"],
              ["grants", "Granted"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`rounded px-3 py-1 text-sm font-medium ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {canManage ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New Scholarship
            </Button>
            <Button size="sm" onClick={() => setGrantOpen(true)}>
              Grant Scholarship
            </Button>
          </div>
        ) : null}
      </div>

      {tab === "schemes" ? (
        <GenericTable
          tableHeads={schemeHead}
          data={schemeRows}
          onEdit={
            canManage
              ? (scheme) => {
                  setEditing(scheme);
                  setFormOpen(true);
                }
              : undefined
          }
          onDelete={canManage ? (scheme) => setDeleteId(scheme.id) : undefined}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search scholarships..."
          emptyTitle="No scholarships yet."
          pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        />
      ) : (
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
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      revokeMut.isPending || Boolean(grant.revokedAt)
                    }
                    onClick={() => revokeMut.mutate(grant.id)}
                  >
                    Revoke
                  </Button>
                )
              : undefined
          }
        />
      )}

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

      {grantOpen ? (
        <GrantScholarshipDialog
          open={grantOpen}
          onOpenChange={setGrantOpen}
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
