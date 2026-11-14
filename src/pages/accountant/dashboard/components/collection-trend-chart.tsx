import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNpr, formatNprShort } from "@/lib/money";
import {
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";
import type { T_TrendPoint } from "../service/service";

const chartConfig = {
  total: { label: "Collected", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** Fee collection per BS month. */
export default function CollectionTrendChart({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_TrendPoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const total = data.reduce((sum, point) => sum + point.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Collection Trend</CardTitle>
        <CardDescription>
          Collected per BS month · {formatNpr(total)} in total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-[240px]" />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : data.length === 0 ? (
          <WidgetEmpty
            title="No collection yet"
            description="Fee receipts will show up here as they are recorded."
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value: number) => formatNprShort(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatNpr(Number(value))}
                  />
                }
              />
              <Area
                dataKey="total"
                type="monotone"
                fill="var(--color-total)"
                fillOpacity={0.25}
                stroke="var(--color-total)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
