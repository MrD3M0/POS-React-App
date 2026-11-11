import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
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
import type { T_DashboardClassAttendance } from "@/types/teacher-dashboard";
import { formatPercent } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

const chartConfig = {
  attendance: { label: "Attendance %", color: "var(--chart-1)" },
} satisfies ChartConfig;

const THRESHOLD = 75;

export default function ClassAttendanceChart({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardClassAttendance[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const chartData = data.map((row) => ({
    ...row,
    shortLabel: row.subjectName,
  }));
  const below = chartData.filter((row) => row.presentPercent < THRESHOLD);
  const average = chartData.length
    ? chartData.reduce((sum, row) => sum + row.presentPercent, 0) /
      chartData.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class-wise Attendance %</CardTitle>
        <CardDescription>
          Attendance per class, {THRESHOLD}% is the required threshold
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-[220px]" />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : chartData.length === 0 ? (
          <WidgetEmpty
            title="No classes yet"
            description="Teaching assignments will show up here."
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[240px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 4, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tickFormatter={(value: string) =>
                  value.length > 14 ? `${value.slice(0, 13)}…` : value
                }
              />
              <YAxis
                width={32}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload?.label ?? ""
                    }
                  />
                }
              />
              <ReferenceLine
                y={THRESHOLD}
                stroke="var(--color-destructive)"
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="presentPercent"
                fill="var(--color-attendance)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {chartData.length === 0
          ? "Attendance per class appears once sessions are marked."
          : below.length > 0
            ? `${below.length} class${below.length === 1 ? " is" : "es are"} below ${THRESHOLD}% (average ${formatPercent(average)}).`
            : `Every class is at or above ${THRESHOLD}% (average ${formatPercent(average)}).`}
      </CardFooter>
    </Card>
  );
}
