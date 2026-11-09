import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PaginationControls from "@/components/common/PaginationControls";
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Search, Edit, Trash2 } from "lucide-react";
import { useDebounce } from "use-debounce";

import { getAllAccountants, removeAccountant, type T_ACCOUNTANT } from "./service/service";

const LIMIT = 10; // per the user's spec

export default function AccountantListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [debouncedSearch] = useDebounce(search, 500);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_LIST, page, debouncedSearch],
    queryFn: () => getAllAccountants({ page, search: debouncedSearch, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_ACCOUNTANT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Accountants"
        description="Manage employee-assigned accountants and their assignments."
        createPage="/accountant/create"
        createPageTitle="Add Accountant"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Accountants", link: "/accountant/accountants" },
        ]}
        actions={
          <>
            <div className="relative w-80">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search accountants..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Link to="/accountant/create">
              <Button variant="outline" size="sm">
                New Accountant
              </Button>
            </Link>
          </>
        }
      />

      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">Employee ID</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Designation</th>
              <th className="px-3 py-2 text-left font-medium">Gender</th>
              <th className="px-3 py-2 text-right font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  No accountants found.
                </td>
              </tr>
            ) : (
              rows.map((acc, index) => (
                <tr key={acc.id}>
                  <td className="px-3 py-2 tabular-nums">{page * LIMIT - LIMIT + index + 1}</td>
                  <td className="font-mono text-xs px-3 py-2">{acc.employeeId}</td>
                  <td className="px-3 py-2 font-medium">{`${acc.firstName} ${acc.lastName ?? ""}`}</td>
                  <td className="px-3 py-2">{acc.designation}</td>
                  <td className="px-3 py-2">{acc.gender}</td>
                  <td className="px-3 py-2 text-right">
                    <Badge variant={acc.isActive ? "default" : "destructive"}>
                      {acc.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/accountant/edit/${acc.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(acc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <PaginationControls currentPage={page} lastPage={lastPage} onPageChange={setPage} />
      )}

      {deleteId && (
        <ConfirmDeleteDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Accountant"
          onDelete={removeAccountant}
          queryKeysToInvalidate={[[QUERY_KEYS.ACCOUNTANT_LIST]]}
        />
      )}
    </div>
  );
}
