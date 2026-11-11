import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  T_DashboardAttendancePoint,
  T_DashboardFilterOption,
} from "@/types/teacher-dashboard";
import type { T_DashboardRange } from "@/types/teacher-dashboard";
import { formatPercent, shortBsDate } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

const chartConfig = {
  present: { label: "Present", color: "var(--chart-1)" },
  absent: { label: "Absent", color: "var(--chart-2)" },
  late: { label: "Late", color: "var(--chart-3)" },
  leave: { label: "Leave", color: "var(--chart-4)" },
} satisfies ChartConfig;

const RANGE_OPTIONS: { value: T_DashboardRange; label: string }[] = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

export default function AttendanceTrendChart({
  data,
  assignments,
  assignmentId,
  range,
  isLoading,
  isError,
  onRetry,
  onAssignmentChange,
  onRangeChange,
}: {
  data: T_DashboardAttendancePoint[];
  assignments: T_DashboardFilterOption[];
  assignmentId: string;
  range: T_DashboardRange;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  onAssignmentChange: (value: string) => void;
  onRangeChange: (value: T_DashboardRange) => void;
}) {
  const hasRecords = data.some(
    (point) => point.present + point.absent + point.late + point.leave > 0,
  );
  const totalPresent = data.reduce((sum, point) => sum + point.present, 0);
  const totalRecords = data.reduce(
    (sum, point) =>
      sum + point.present + point.absent + point.late + point.leave,
    0,
  );
  const rate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
  const selectedLabel =
    assignments.find((option) => option.id === assignmentId)?.label ??
    "All classes";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trend</CardTitle>
        <CardDescription>
          Daily attendance for the last {range} days
        </CardDescription>
        <CardAction className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Select
            value={assignmentId || "all"}
            onValueChange={(value) =>
              onAssignmentChange(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[190px]" size="sm">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {assignments.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={String(range)}
            onValueChange={(value) => {
              if (!value) return;
              onRangeChange(Number(value) as T_DashboardRange);
            }}
          >
            {RANGE_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={String(option.value)}
                aria-label={`Last ${option.value} days`}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-[220px]" />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : !hasRecords ? (
          <WidgetEmpty
            title="No attendance recorded yet"
            description={`No sessions were marked for ${selectedLabel} in this period.`}
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[240px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 4, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value: string) => shortBsDate(value).slice(5)}
              />
              <YAxis
                width={28}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="present"
                type="natural"
                stackId="attendance"
                stroke="var(--color-present)"
                fill="var(--color-present)"
                fillOpacity={0.35}
              />
              <Area
                dataKey="absent"
                type="natural"
                stackId="attendance"
                stroke="var(--color-absent)"
                fill="var(--color-absent)"
                fillOpacity={0.35}
              />
              <Area
                dataKey="late"
                type="natural"
                stackId="attendance"
                stroke="var(--color-late)"
                fill="var(--color-late)"
                fillOpacity={0.35}
              />
              <Area
                dataKey="leave"
                type="natural"
                stackId="attendance"
                stroke="var(--color-leave)"
                fill="var(--color-leave)"
                fillOpacity={0.35}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {hasRecords
          ? `${selectedLabel}: ${formatPercent(rate)} attendance recorded over ${range} days.`
          : "Attendance totals appear once sessions are marked."}
      </CardFooter>
    </Card>
  );
}
