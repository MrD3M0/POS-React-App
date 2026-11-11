import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  T_DashboardFilterOption,
  T_DashboardResultDistribution,
} from "@/types/teacher-dashboard";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

const chartConfig = {
  students: { label: "Students", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function ResultDistributionChart({
  distribution,
  examBatches,
  examBatchId,
  isLoading,
  isError,
  onRetry,
  onExamBatchChange,
}: {
  distribution: T_DashboardResultDistribution;
  examBatches: T_DashboardFilterOption[];
  examBatchId: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  onExamBatchChange: (value: string) => void;
}) {
  const hasData = distribution.total > 0;
  const passRate =
    distribution.total > 0
      ? (distribution.passed / distribution.total) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result Distribution</CardTitle>
        <CardDescription>
          Marks buckets for {distribution.label || "the selected exam batch"}
        </CardDescription>
        <CardAction>
          <Select
            value={examBatchId || "all"}
            onValueChange={(value) =>
              onExamBatchChange(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[200px]" size="sm">
              <SelectValue placeholder="Select exam batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All exam batches</SelectItem>
              {examBatches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-[220px]" />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : !hasData ? (
          <WidgetEmpty
            title="No results yet"
            description="Marks have not been entered for this exam batch."
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[240px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={distribution.buckets}
              margin={{ left: 4, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                width={28}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                name="students"
                fill="var(--color-students)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {hasData
          ? `${distribution.passed} passed · ${distribution.failed} failed · ${passRate.toFixed(1)}% pass rate.`
          : "Pass and fail counts appear once marks are entered."}
      </CardFooter>
    </Card>
  );
}
