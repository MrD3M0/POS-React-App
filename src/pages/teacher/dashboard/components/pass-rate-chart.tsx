import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
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
import type { T_DashboardPassRate } from "@/types/teacher-dashboard";
import { formatPercent } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

const chartConfig = {
  passPercent: { label: "Pass %", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function PassRateChart({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardPassRate;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const chartData = data.subjects.map((subject) => ({
    ...subject,
    fill: "var(--color-passPercent)",
  }));
  const hasData = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pass Rate by Subject</CardTitle>
        <CardDescription>
          Pass percentage for {data.label || "the selected exam"}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-[220px]" />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : !hasData ? (
          <WidgetEmpty
            title="No subjects yet"
            description="Pass rates appear once results exist for this exam."
          />
        ) : (
          <div className="relative">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[240px] w-full"
            >
              <RadialBarChart
                accessibilityLayer
                data={chartData}
                startAngle={90}
                endAngle={-270}
                innerRadius="30%"
                outerRadius="100%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  tick={false}
                  tickCount={5}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <RadialBar
                  dataKey="passPercent"
                  name="passPercent"
                  background={{ fill: "var(--muted)" }}
                  cornerRadius={4}
                />
              </RadialBarChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight">
                {formatPercent(data.overallPassPercent)}
              </span>
              <span className="text-xs text-muted-foreground">
                overall pass rate
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {hasData
          ? data.subjects
              .map(
                (subject) =>
                  `${subject.subjectName}: ${formatPercent(subject.passPercent)}`,
              )
              .join(" · ")
          : "Subject pass rates appear once results are published."}
      </CardFooter>
    </Card>
  );
}
