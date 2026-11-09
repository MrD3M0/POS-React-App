import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query"; // CHANGED: added keepPreviousData
import { Link } from "react-router";
import { Edit, Trash2, Search } from "lucide-react";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAllBatches, removeBatch, type T_Batch } from "./service/service";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import PaginationControls from "@/components/common/PaginationControls";
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "use-debounce";

const LIMIT = 10; // NEW

export default function BatchListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.BATCH_LIST, page, debouncedSearch],
    queryFn: () =>
      getAllBatches({ page, search: debouncedSearch, limit: LIMIT }), // CHANGED: 10 -> LIMIT
    placeholderData: keepPreviousData, // NEW
  });

  const batches: T_Batch[] = data?.data?.data ?? [];
  const total = data?.data?.pagination?.total ?? 0; // CHANGED: replaces `pagination`
  const lastPage = Math.max(1, Math.ceil(total / LIMIT)); // NEW: this fixes the error

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Batches"
        description="Manage academic batches, terms, and schedules."
        createPage="/batch/create"
        createPageTitle="Add Batch"
        breadCrumbItems={[
          { title: "Dashboard", link: "/dashboard" },
          { title: "Batches" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-80">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // NEW: reset to page 1 on search
            }}
          />
        </div>
      </div>

      {isLoading && <ScreenLoader />}

      {isError && (
        <AlertHandler
          variant="error"
          title="Error"
          message="Failed to load batches. Please try again."
        />
      )}

      {!isLoading && !isError && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Batch Name</TableHead>
                <TableHead>Course ID</TableHead>
                <TableHead>Start Date (BS)</TableHead>
                <TableHead>Current Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No batches found.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch, index) => (
                  <TableRow key={batch.id}>
                    <TableCell>{(page - 1) * LIMIT + index + 1}</TableCell>
                    {/* CHANGED: 10 -> LIMIT */}
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {batch.courseId}
                    </TableCell>
                    <TableCell>{batch.startDateBs || "-"}</TableCell>
                    <TableCell>Term {batch.currentTermNumber}</TableCell>
                    <TableCell>
                      <Badge variant={batch.isActive ? "default" : "secondary"}>
                        {batch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/batch/edit/${batch.id}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(batch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {lastPage > 1 && ( // CHANGED: was pagination.lastPage
        <PaginationControls
          currentPage={page}
          lastPage={lastPage} // CHANGED: was pagination.lastPage
          onPageChange={setPage}
        />
      )}

      {deleteId && (
        <ConfirmDeleteDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          onDelete={removeBatch}
          queryKeysToInvalidate={[[QUERY_KEYS.BATCH_LIST]]}
          itemName="batch"
        />
      )}
    </div>
  );
}
