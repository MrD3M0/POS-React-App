import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import { UserCheck, UserX, Users, Phone } from "lucide-react";
import { getAllAccountants } from "@/pages/accountant/accountants/service/service";
import type { T_ACCOUNTANT } from "@/pages/accountant/accountants/service/service";

const LIMIT = 50;

export default function PrincipalAccountantsPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["principal-accountants", search],
    queryFn: () => getAllAccountants({ page: 1, search, limit: LIMIT }),
  });

  const rows: T_ACCOUNTANT[] = useMemo(() => {
    const d = query.data as unknown as { data?: T_ACCOUNTANT[] | { data?: T_ACCOUNTANT[] } };
    const raw = d?.data as unknown;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      return (raw as { data: T_ACCOUNTANT[] }).data;
    }
    return [];
  }, [query.data]);

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const active = rows.filter((r) => r.isActive).length;
  const inactive = rows.length - active;

  return (
    <div className="p-5 space-y-6">
      <PageHeader
        title="Accountants"
        description="Oversight of accounting team and assignments."
        breadCrumbItems={[{ title: "Principal", link: "/principal/accountants" }, { title: "Accountants", link: "/principal/accountants" }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-background p-5">
          <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Total Accountants</span></div>
          <p className="mt-2 text-3xl font-bold tabular-nums">{rows.length}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-background p-5">
          <div className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-emerald-600" /><span className="text-sm text-muted-foreground">Active</span></div>
          <p className="mt-2 text-3xl font-bold tabular-nums">{active}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-destructive/10 to-background p-5">
          <div className="flex items-center gap-2"><UserX className="h-5 w-5 text-destructive" /><span className="text-sm text-muted-foreground">Inactive</span></div>
          <p className="mt-2 text-3xl font-bold tabular-nums">{inactive}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accountants..."
          className="h-9 w-80 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No accountants found.</p>}
        {rows.map((acc) => (
          <div key={acc.id} className="rounded-xl border p-4 space-y-2 hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{`${acc.firstName} ${acc.lastName ?? ""}`}</p>
                <p className="text-xs text-muted-foreground">{acc.designation}</p>
              </div>
              <Badge variant={acc.isActive ? "default" : "destructive"}>{acc.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="text-xs font-mono">{acc.employeeId}</p>
            <p className="text-xs text-muted-foreground">{acc.email}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{acc.phone ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Gender: {acc.gender}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
