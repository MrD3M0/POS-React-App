"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getBestSellers,
  getLifeTimeSales,
  getStockALert,
} from "@/pages/dashboard/service/service";
import { useQuery } from "@tanstack/react-query";
import {
  Info,
  TrendingUp,
  Loader2,
  TriangleAlert,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/button";

const BEST_SELLER_LIMIT = 5;

export function SectionCards() {
  const [stockAlertOpen, setStockAlertOpen] = useState<boolean>(false);
  const [bestSellerPage, setBestSellerPage] = useState<number>(1);

  const TotalLifeTimeRevenueQuery = useQuery({
    queryKey: [QUERY_KEYS.TOTAL_SALES],
    queryFn: () => getLifeTimeSales(),
  });

  const BestSellersQuery = useQuery({
    queryKey: [QUERY_KEYS.BEST_SELLERS, bestSellerPage],
    queryFn: () =>
      getBestSellers({ page: bestSellerPage, limit: BEST_SELLER_LIMIT }),
  });

  // Separate query for card title (always page 1, limit 1)
  const BestSellerTopQuery = useQuery({
    queryKey: [QUERY_KEYS.BEST_SELLERS, 1, 1],
    queryFn: () => getBestSellers({ page: 1, limit: 1 }),
  });

  const LowStockALertQuery = useQuery({
    queryKey: [QUERY_KEYS.LOW_STOCK],
    queryFn: () => getStockALert(),
  });

  return (
    <div className="grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Lifetime Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>LifeTime Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rs.{TotalLifeTimeRevenueQuery.data?.data?.totalSales || 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Bills: {TotalLifeTimeRevenueQuery.data?.data?.totalBills || 0}
          </div>
          <div className="text-muted-foreground">
            Avg Bill Value Rs.{" "}
            {(
              (TotalLifeTimeRevenueQuery.data?.data?.totalSales || 0) /
              (TotalLifeTimeRevenueQuery.data?.data?.totalBills || 1)
            ).toFixed(2)}
          </div>
        </CardFooter>
      </Card>

      {/* Best Selling Product */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Best Selling Product</CardDescription>
          <CardTitle className="text-1xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {BestSellerTopQuery.isLoading
              ? "..."
              : (BestSellerTopQuery.data?.data?.data[0]?.product.name ?? "N/A")}
          </CardTitle>
          <CardAction>
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer">
                      <Info className="size-3" />
                    </Badge>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View all best sellers</p>
                </TooltipContent>
              </Tooltip>

              <PopoverContent
                className="w-72 p-0 [scrollbar-width:thin] [scrollbar-color:gray_transparent]"
                align="end"
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">Best Selling Products</p>
                  <Badge variant="secondary" className="text-xs">
                    {BestSellersQuery.data?.data?.pagination?.total ?? 0} total
                  </Badge>
                </div>

                <div className="max-h-64 divide-y overflow-y-auto">
                  {BestSellersQuery.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : BestSellersQuery.data?.data?.data?.length ? (
                    BestSellersQuery.data.data.data.map((item, index) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <span className="w-5 text-xs font-medium text-muted-foreground">
                          #
                          {(bestSellerPage - 1) * BEST_SELLER_LIMIT + index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rs. {item.product.price}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {item.totalQuantitySold} sold
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No data yet
                    </div>
                  )}
                </div>

                {(BestSellersQuery.data?.data?.pagination?.total ?? 0) >
                  BEST_SELLER_LIMIT && (
                  <div className="flex items-center justify-between border-t px-4 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={bestSellerPage === 1}
                      onClick={() => setBestSellerPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                      Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {bestSellerPage} /{" "}
                      {Math.ceil(
                        (BestSellersQuery.data?.data?.pagination?.total ?? 0) /
                          BEST_SELLER_LIMIT,
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        bestSellerPage ===
                        Math.ceil(
                          (BestSellersQuery.data?.data?.pagination?.total ??
                            0) / BEST_SELLER_LIMIT,
                        )
                      }
                      onClick={() => setBestSellerPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {BestSellerTopQuery.isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : BestSellerTopQuery.data?.data?.data[0] ? (
              <>
                <TrendingUp className="size-6" />
                {BestSellerTopQuery.data.data.data[0].totalQuantitySold} units
                sold
              </>
            ) : (
              <span className="text-muted-foreground">No sales yet</span>
            )}
          </div>
          <div className="text-muted-foreground">
            {BestSellerTopQuery.data?.data?.data[0] ? (
              <>
                Rs. {BestSellerTopQuery.data.data.data[0].product.price} per
                unit
              </>
            ) : (
              "Best selling product will appear here"
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Stock Alert */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Stock Alert</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {LowStockALertQuery.isLoading
              ? "..."
              : (LowStockALertQuery.data?.data?.length ?? 0)}
          </CardTitle>
          <CardAction>
            <Popover open={stockAlertOpen} onOpenChange={setStockAlertOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer">
                      <Info className="size-3" />
                    </Badge>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View low stock products</p>
                </TooltipContent>
              </Tooltip>

              <PopoverContent className="w-72 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">Low Stock Products</p>
                  <Badge variant="destructive" className="text-xs">
                    {LowStockALertQuery.data?.data?.length ?? 0} items
                  </Badge>
                </div>

                <div className="max-h-64 divide-y overflow-y-auto">
                  {LowStockALertQuery.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : LowStockALertQuery.data?.data?.length ? (
                    LowStockALertQuery.data.data.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rs. {item.price}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.quantity === 0 ? "destructive" : "outline"
                          }
                          className="shrink-0 text-xs"
                        >
                          {item.quantity === 0
                            ? "Out of stock"
                            : `${item.quantity} left`}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      All products are well stocked
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {LowStockALertQuery.isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : LowStockALertQuery.data?.data?.length ? (
              <>
                <TriangleAlert className="size-4 text-destructive" />
                {LowStockALertQuery.data.data.length} product
                {LowStockALertQuery.data.data.length > 1 ? "s" : ""} need
                restocking
              </>
            ) : (
              <>
                <PackageCheck className="size-4 text-green-500" />
                All products stocked
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            {LowStockALertQuery.data?.data?.length
              ? `Including: ${LowStockALertQuery.data.data[0].name}${LowStockALertQuery.data.data.length > 1 ? ` and ${LowStockALertQuery.data.data.length - 1} more` : ""}`
              : "Stock levels are healthy"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
