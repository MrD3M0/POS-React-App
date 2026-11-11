import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import type { T_PendingByBatch } from "../service/service";

const chartConfig = {
  due: { label: "Pending", color: "var(--chart-4)" },
} satisfies ChartConfig;

/** Outstanding fees per class (batch). */
export default function PendingFeesChart({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_PendingByBatch[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const rows = data.map((row) => ({
    label: `${row.batch}${row.course ? ` · ${row.course}` : ""}`,
    due: row.due,
    students: row.students,
  }));
  const total = rows.reduce((sum, row) => sum + row.due, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Fees by Class</CardTitle>
        <CardDescription>
          Outstanding per batch · {formatNpr(total)} in total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-[240px]" />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : rows.length === 0 ? (
          <WidgetEmpty
            title="Nothing outstanding"
            description="Every student fee of the college is settled."
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart data={rows} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatNprShort(value)}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatNpr(Number(value))}
                  />
                }
              />
              <Bar dataKey="due" fill="var(--color-due)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
