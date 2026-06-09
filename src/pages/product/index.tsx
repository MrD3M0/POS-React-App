// components/product/products.tsx
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
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";
import { QUERY_KEYS } from "@/lib/query-keys";

import {
  getAllProducts,
  removeProduct,
  type T_Products,
} from "./service/service";

const LIMIT = 10;

const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const navigate = useNavigate();

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_LIST, debouncedSearch, page],
    queryFn: () =>
      getAllProducts({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const rows: T_Products[] = result?.data?.data ?? [];
  const total: number = result?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Products"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Products", link: "/product" },
        ]}
        createPage="/product/create"
      />

      <div className="px-8">
        <div className="mb-4">
          <Input
            className="w-72"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {isLoading && <ScreenLoader />}

        {isError && (
          <div className="flex items-center justify-center py-10 text-destructive">
            Failed to load products.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            <div className="w-full overflow-x-auto border rounded-md">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.N.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Short Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{(page - 1) * LIMIT + idx + 1}</TableCell>
                        <TableCell>{item.name ?? "—"}</TableCell>
                        <TableCell>{item.shortName ?? "—"}</TableCell>
                        <TableCell>{item.price ?? "—"}</TableCell>
                        <TableCell>{item.quantity ?? "—"}</TableCell>
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
                            onClick={() => navigate(`/product/${item.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedItemId(item.id);
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
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemId={selectedItemId}
        onDelete={removeProduct}
        itemName="Product"
      />
    </div>
  );
};

export default Products;
