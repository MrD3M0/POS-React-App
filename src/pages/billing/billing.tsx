import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import {
  getAllCategories,
  type T_Categories,
} from "../categories/service/service";
import ScreenLoader from "@/components/ui/screen-loader";
import { Button } from "@/components/ui/button";
import {
  productsByCategory,
  type T_ProductsByCategory,
} from "../product/service/service";
import { useState } from "react";
import AlertHandler from "@/components/common/alert-handler";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";

export default function BillingPage() {
  const [currentSelectedCategory, setCurrentSelectedCategory] =
    useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
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
  // Query to Search Products By name and Category
  const getProductByNameAndCategoryQuery = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_LIST, debouncedSearch],
    queryFn: () => getAllProducts({}),
  });
  // Errors and Loading Handling
  if (isCategoryFetchLoading && getProductByCategoryQuery.isLoading) {
    return <ScreenLoader />;
  }
  return (
    <div className="p-5">
      <Card className="w-1/2 h-147">
        <div className="mb-1 ml-2">
          <Input
            className="w-72"
            placeholder="Search products by name or category...."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <ScrollArea className="w-90 gap-2 whitespace-nowrap">
          {Categories.map((category, i) => (
            <span className="ml-2">
              <Button
                onClick={() => {
                  setCurrentSelectedCategory(category.id);
                }}
                key={i}
                value={category.id}
              >
                {category.name}
              </Button>
            </span>
          ))}

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <ScrollArea>
          <div className="grid grid-cols-2  md:grid-cols-3 gap-2">
            {getProductByCategoryQuery.isError &&
              !getProductByCategoryQuery.isLoading && (
                <AlertHandler
                  className="grid col-span-3"
                  variant="error"
                  title="Error Occured"
                  message="Something went wrong while fetching products. Please try again."
                />
              )}
            {Products.length === 0 && (
              <AlertHandler
                className="grid col-span-3 m-1"
                variant="error"
                title="No Products Found"
                message="This category doesn't have any products yet."
              />
            )}
            {Products.map((product, index) => (
              <Card
                key={index}
                className="m-1.5 cursor-pointer hover:bg-muted/70 hover:shadow-md transition-all duration-150"
              >
                <CardContent className="p-3 flex flex-col gap-1">
                  <span className="font-semibold text-sm truncate">
                    {product.name}
                  </span>
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
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
