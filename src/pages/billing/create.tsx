import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getAllCategories,
  getCategoryById,
  type T_Categories,
} from "../categories/service/service";
import ScreenLoader from "@/components/ui/screen-loader";
import { PackageOpen, Check, ChevronsUpDown, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const BillGeneration = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]); // Mock bill state

  // 1. Fetch all categories
  const getCategoriesQuery = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER],
    queryFn: () => getAllCategories({ page: 1, limit: 100, search: "" }),
  });

  // 2. DERIVE the current ID
  const categories = getCategoriesQuery.data?.data?.data || [];
  const firstCategoryId = categories?.[0]?.id;
  const resolvedActiveId = activeCategoryId || firstCategoryId || "";

  // 3. Fetch products using the derived ID
  const getProductByCategoryQuery = useQuery({
    queryKey: [QUERY_KEYS.CATEGORY_LIST, resolvedActiveId],
    queryFn: () => getCategoryById(resolvedActiveId),
    enabled: getCategoriesQuery.isSuccess && !!resolvedActiveId,
  });

  if (getCategoriesQuery.isLoading) {
    return <ScreenLoader />;
  }

  const totalCategories = getCategoriesQuery.data?.data?.pagination?.total ?? 0;
  if (totalCategories === 0) {
    return (
      <div className="border border-border rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center">
        <PackageOpen className="h-10 w-10 mb-2 opacity-50" />
        <p>No categories found.</p>
      </div>
    );
  }

  const currentCategoryName = categories.find(
    (cat: T_Categories) => cat.id === resolvedActiveId
  )?.name || "Select Category...";

  // Handler to push items into our billing column
  const handleAddToBill = (product: any) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    // Grid Setup: 3 columns layout
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5 min-h-screen items-start">
      
      {/* LEFT & CENTER COLUMNS (Span 2): Category Search & Product Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Search & Filter Category
          </label>
          
          {/* Searchable Select (Shadcn Combobox pattern) */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[300px] justify-between"
              >
                {currentCategoryName}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((category: T_Categories) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => {
                          setActiveCategoryId(category.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            resolvedActiveId === category.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Product Grid display */}
        <div>
          {getProductByCategoryQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getProductByCategoryQuery.data?.data?.data?.map((product: any) => (
                <button
                  key={product.id}
                  type="button"
                  className="border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all rounded-xl p-4 text-left flex flex-col justify-between shadow-sm group active:scale-[0.98]"
                  onClick={() => handleAddToBill(product)}
                >
                  <div className="w-full">
                    <h4 className="font-medium text-card-foreground group-hover:text-accent-foreground transition-colors line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      SKU: {product.sku || "N/A"} • Stock:{" "}
                      <span
                        className={
                          product.stock > 0
                            ? "text-emerald-600 font-medium"
                            : "text-destructive font-medium"
                        }
                      >
                        {product.stock ?? 0}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 w-full flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground scale-90 origin-left">
                        Price
                      </span>
                      <span className="font-bold text-lg text-foreground">
                        Rs. {product.price?.toLocaleString() ?? "0.00"}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg opacity-80 group-hover:opacity-100 transition-opacity">
                      +
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN (Span 1): Bill Storing Side Panel */}
      <div className="lg:col-span-1 border border-border bg-card rounded-xl p-5 sticky top-5 shadow-sm flex flex-col h-[calc(100vh-2.5rem)]">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <ReceiptText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Current Bill</h3>
        </div>

        {/* Selected products scroll area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {selectedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm py-12">
              <p>No products added yet.</p>
              <p className="text-xs text-center px-4 mt-1">Click products on the left to populate the bill.</p>
            </div>
          ) : (
            selectedProducts.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Rs. {item.price} x {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Bill calculation summaries */}
        {selectedProducts.length > 0 && (
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between font-bold text-base">
              <span>Total:</span>
              <span>
                Rs.{" "}
                {selectedProducts
                  .reduce((acc, item) => acc + item.price * item.quantity, 0)
                  .toLocaleString()}
              </span>
            </div>
            <Button className="w-full mt-2">Generate Invoice</Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default BillGeneration;