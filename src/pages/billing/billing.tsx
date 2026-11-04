import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  type T_Categories,
} from "../categories/service/service";
import ScreenLoader from "@/components/ui/screen-loader";
import {
  getAllProducts,
  productsByCategory,
  type T_Products,
  type T_ProductsByCategory,
} from "../product/service/service";
import { useState } from "react";
import AlertHandler from "@/components/common/alert-handler";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { billingItemSchema } from "./schema/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button  from "@/components/ui/button";
import { Link } from "react-router";
import { mapFieldsOnError } from "@/lib/utils";
import type { T_UseQueryError } from "@/types/common";
import type { AxiosError } from "axios";
import { type T_BillingItem, type T_ShowBillingItem } from "./types/types";
import SelectCommand from "@/components/common/select-command";
import { createBilling } from "./service/service";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isItemInCart } from "./utils/billing-functions";
import { EditIcon, Info, Minus, PackageX, Plus, X } from "lucide-react";
import { UpdateCartDialog } from "@/components/dialog/cartUpdate-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BillReceiptDialog,
  type T_BillData,
} from "@/components/dialog/bill-receipt-dialog";

export default function BillingPage() {
  const [currentSelectedCategory, setCurrentSelectedCategory] =
    useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [visibleBillingItems, setVisibleBillingItems] = useState<
    T_ShowBillingItem[]
  >([]);
  const [billingItems, setBillingItems] = useState<T_BillingItem[]>([]);
  const [openCartUpdateDialog, setOpenCartUpdateDialog] =
    useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<{
    productId: string;
    displayName: string;
    currentQuantity: number;
    quantityLimit: number;
  } | null>(null);
  const [billReceiptOpen, setBillReceiptOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState<T_BillData | null>(null);
  const qc = useQueryClient();
  const form = useForm({
    resolver: zodResolver(billingItemSchema),
    defaultValues: { discountType: "Percentage", discount: 0 },
  });

  const createBillingMutation = useMutation({
    mutationFn: createBilling,
    onSuccess: (res) => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCT_LIST],
      });
      setCreatedBill(res.data);
      setBillReceiptOpen(true);
      setBillingItems([]);
      setVisibleBillingItems([]);

      form.reset();
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      const errors = error.response?.data?.data;

      if (errors && !Array.isArray(errors) && errors["quantity"]) {
        toast.error(errors["quantity"][0]);
        return;
      }
      mapFieldsOnError(error, form.setError);
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const { data: result, isLoading: isCategoryFetchLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORY_LIST],
    queryFn: () => getAllCategories({ page: 1, search: "", limit: 100 }),
  });

  const Categories: T_Categories[] = result?.data?.data ?? [];

  if (!currentSelectedCategory && Categories.length > 0) {
    setCurrentSelectedCategory(Categories[0].id);
  }

  // Query To Fetch Products by Category
  const getProductByCategoryQuery = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_LIST, currentSelectedCategory],
    queryFn: () => productsByCategory(currentSelectedCategory),
    enabled: !!currentSelectedCategory,
  });

  const Products: T_ProductsByCategory[] = getProductByCategoryQuery.data ?? [];

  // Query to Search Products By name
  const getProductBySearchQuery = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_LIST, debouncedSearch],
    queryFn: () =>
      getAllProducts({ search: debouncedSearch, page: 1, limit: 100 }),
    enabled: !!debouncedSearch,
  });

  const SearchedProducts: T_Products[] =
    getProductBySearchQuery.data?.data?.data ?? [];

  const removeProductFromBilling = (productId: string) => {
    setBillingItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId),
    );
    setVisibleBillingItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId),
    );
  };
  const increseProductToBilling = (productId: string, quantity: number = 1) => {
    setBillingItems((prevItems) =>
      prevItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
    setVisibleBillingItems((prevItems) =>
      prevItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };
  const decreaseProductToBilling = (productId: string) => {
    setBillingItems((prevItems) =>
      prevItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
    setVisibleBillingItems((prevItems) =>
      prevItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };
  const handleAddProductToBilling = (
    product: T_Products | T_ProductsByCategory,
  ) => {
    const { id, name, price, quantity } = product;
    const existingItem: boolean = isItemInCart(
      visibleBillingItems,
      billingItems,
      id,
    );
    if (existingItem) {
      const cartItem = visibleBillingItems.find((i) => i.productId === id);
      if (cartItem && cartItem.quantity >= quantity) {
        toast.error(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">Stock Limit Reached</span>
            <span className="text-xs text-muted-foreground">
              Only{" "}
              <span className="font-medium text-foreground">
                {cartItem.stockQuantity}
              </span>{" "}
              units available in stock.
            </span>
          </div>,
          {
            icon: (
              <PackageX className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            ),
          },
        );
        return;
      }
      setBillingItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      setVisibleBillingItems((prev) =>
        prev.map((item) =>
          item.productId === id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setBillingItems((prevItems) => [
        ...prevItems,
        {
          productId: id,
          quantity: 1,
        },
      ]);
      setVisibleBillingItems((prev) => [
        ...prev,
        {
          productId: id,
          productName: name,
          price: price,
          quantity: 1,
          total: price,
          stockQuantity: quantity,
        },
      ]);
    }
  };
  const grandTotal = visibleBillingItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (isCategoryFetchLoading || getProductByCategoryQuery.isLoading) {
    return <ScreenLoader />;
  }

  return (
    <div className="p-3 flex gap-3 h-screen no-scrollbar">
      <Card className="w-1/2 h-[90%] overflow-hidden">
        {/* Search Input */}
        <div className="pl-2">
          <Input
            className="w-72"
            placeholder="Search products by name or category...."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Category Tabs */}
        <ScrollArea className="w-full whitespace-nowrap pb-1 border-b">
          <div className="flex gap-2 px-2 py-1">
            {Categories.map((category, i) => (
              <button
                key={i}
                disabled={!!debouncedSearch}
                onClick={() => setCurrentSelectedCategory(category.id)}
                className={`
                  shrink-0 px-4 py-1.5 rounded-md text-sm font-medium
                  transition-all duration-150 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${
                    currentSelectedCategory === category.id && !debouncedSearch
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Products Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {debouncedSearch ? (
              <>
                {getProductBySearchQuery.isLoading && (
                  <div className="col-span-3 flex justify-center p-4">
                    <ScreenLoader />
                  </div>
                )}
                {getProductBySearchQuery.isError && (
                  <AlertHandler
                    className="col-span-3"
                    variant="error"
                    title="Error Occured"
                    message="Something went wrong while searching products."
                  />
                )}
                {!getProductBySearchQuery.isLoading &&
                  SearchedProducts.length === 0 && (
                    <AlertHandler
                      className="w-70! m-1"
                      variant="error"
                      title="No Products Found"
                      message="No products match your search."
                    />
                  )}
                {SearchedProducts.map((product, index) => (
                  <Card
                    key={index}
                    className={`relative m-1.5 transition-all duration-150 ${
                      product.quantity <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-muted/70 hover:shadow-md"
                    }`}
                    onClick={() => {
                      if (product.quantity <= 0) {
                        toast.error("This item is currently out of stock");
                        return; // ✅ early return — add hँदैन
                      }
                      handleAddProductToBilling(product);
                    }}
                  >
                    <CardContent className="p-3 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm truncate">
                          {product.name}
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label={`View details for ${product.name}`}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-64 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-1.5">
                              <p className="font-semibold leading-none">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.shortName}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-muted-foreground">
                                  Price
                                </span>
                                <span className="font-medium">
                                  Rs. {product.price}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  In Stock
                                </span>
                                <span className="font-medium">
                                  {product.quantity}
                                </span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.shortName}
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-primary">
                          Rs. {product.price}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Qty: {product.quantity}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                {getProductByCategoryQuery.isError &&
                  !getProductByCategoryQuery.isLoading && (
                    <AlertHandler
                      className="col-span-3"
                      variant="error"
                      title="Error Occured"
                      message="Something went wrong while fetching products. Please try again."
                    />
                  )}
                {Products.length === 0 && (
                  <AlertHandler
                    className="col-span-3 m-1"
                    variant="error"
                    title="No Products Found"
                    message="This category doesn't have any products yet."
                  />
                )}
                {Products.map((product, index) => (
                  <Card
                    key={index}
                    className={`relative m-1.5 transition-all duration-150 ${
                      product.quantity <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-muted/70 hover:shadow-md"
                    }`}
                    onClick={() => {
                      if (product.quantity <= 0) {
                        toast.error("This item is currently out of stock");
                        return;
                      }
                      handleAddProductToBilling(product);
                    }}
                  >
                    <CardContent className="p-3 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm truncate">
                          {product.name}
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label={`View details for ${product.name}`}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-64 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-1.5">
                              <p className="font-semibold leading-none">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.shortName}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-muted-foreground">
                                  Price
                                </span>
                                <span className="font-medium">
                                  Rs. {product.price}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  In Stock
                                </span>
                                <span className="font-medium">
                                  {product.quantity}
                                </span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.shortName}
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-primary">
                          Rs. {product.price}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Qty: {product.quantity}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </Card>
      <Card className="w-1/2 h-[90%] overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (billingItems.length === 0) {
                toast.error(
                  "Please add at least one product to the billing list!",
                );
                return;
              }
              createBillingMutation.mutate({
                ...data,
                products: billingItems,
              });
            })}
          >
            <div className="grid grid-cols-1 p-3 gap-2">
              <ScrollArea className="overflow-y-auto overflow-x-auto h-55 rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/50 z-10">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="w-10 text-center">SN</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-16 text-center">
                        Quantity
                      </TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead> </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleBillingItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0!">
                          <div className="w-full h-full"></div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleBillingItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">
                            {item.price}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  decreaseProductToBilling(item.productId);
                                }}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm tabular-nums">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  increseProductToBilling(item.productId);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="flex justify-center items-center">
                              Rs. {item.quantity * item.price}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              {" "}
                              <Button
                                type="button"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingItem({
                                    productId: item.productId,
                                    displayName: item.productName,
                                    currentQuantity: item.quantity,
                                    quantityLimit: item.stockQuantity ?? 0,
                                  });
                                  setOpenCartUpdateDialog(true);
                                }}
                              >
                                <EditIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant={"ghost"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeProductFromBilling(item.productId);
                                }}
                              >
                                <X />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Grand Total</TableCell>
                    <TableCell colSpan={3} />
                    <TableCell className="text-right font-bold">
                      Rs. {grandTotal}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                      <SelectCommand
                        options={[
                          { label: "Percentage", value: "Percentage" },
                          { label: "Flat", value: "Fixed" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Eg: 5% or Rs.100"
                        value={field.value as number}
                        onChange={field.onChange}
                        onFocus={(e) => e.target.select()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end items-center mr-2 gap-2">
              <Link to={"/dashboard"}>
                <Button
                  type="button"
                  disabled={createBillingMutation.isPending}
                  variant={"secondary"}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                loading={createBillingMutation.isPending}
                disabled={createBillingMutation.isPending}
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      <UpdateCartDialog
        key={editingItem?.productId}
        open={openCartUpdateDialog}
        onOpenChange={setOpenCartUpdateDialog}
        productId={editingItem?.productId}
        itemDisplayName={editingItem?.displayName}
        itemQuantityLimit={editingItem?.quantityLimit}
        currentQuantity={editingItem?.currentQuantity}
        setVisibleCart={setVisibleBillingItems}
        setActualCart={setBillingItems}
      />
      <BillReceiptDialog
        open={billReceiptOpen}
        onOpenChange={setBillReceiptOpen}
        bill={createdBill}
      />
    </div>
  );
}
