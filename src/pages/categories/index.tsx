import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { useNavigate } from "react-router";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getAllCategories,
  removeCategory,
  type T_Categories,
} from "./service/service";
import { QUERY_KEYS } from "@/lib/query-keys";
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";

const LIMIT = 10;

const Categories = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemId, setselectedItemId] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const navigate = useNavigate();

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORY, debouncedSearch, page],
    queryFn: () =>
      getAllCategories({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const rows: T_Categories[] = result?.data?.data ?? [];
  const total: number = result?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Reset to page 1 when search changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-screen overflow-x-hidden mx-auto px-8">
      <PageHeader
        title="Categories"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Categories", link: "/category" },
        ]}
        createPage="/category/create"
      />

      {/* Search */}
      <div className="relative mb-4">
        <Input
          className="w-72"
          placeholder="Search categories..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Loading */}
      {isLoading && <ScreenLoader />}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-10 text-destructive">
          Failed to load categories.
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="space-y-3">
          <div className="w-full overflow-x-auto border rounded-md">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.N.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Short Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell>{(page - 1) * LIMIT + idx + 1}</TableCell>
                      <TableCell>{item.name ?? "—"}</TableCell>
                      <TableCell>{item.shortName ?? "—"}</TableCell>
                      <TableCell>
                        {item.createdAt?.split("T")[0] ?? "—"}
                      </TableCell>
                      <TableCell>
                        {item.updatedAt?.split("T")[0] ?? "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => navigate(`/category/${item.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setselectedItemId(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemId={selectedItemId ?? ""}
        onDelete={removeCategory}
        itemName="Category"
      />
    </div>
  );
};

export default Categories;
