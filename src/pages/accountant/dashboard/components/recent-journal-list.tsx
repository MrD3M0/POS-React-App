import { Link } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNpr } from "@/lib/money";
import {
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";
import type { T_JournalEntry } from "../service/service";

/** The last journal entries (vouchers) of the college. */
export default function RecentJournalList({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_JournalEntry[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Journal Entries</CardTitle>
        <CardDescription>The latest vouchers posted in the books.</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link to="/accountant/journal">Open journal</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={5} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : data.length === 0 ? (
          <WidgetEmpty
            title="No journal entry"
            description="Vouchers appear here as soon as money moves."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Voucher No.</TableHead>
                <TableHead scope="col">Date (BS)</TableHead>
                <TableHead scope="col">Narration</TableHead>
                <TableHead scope="col" className="text-right">Debit</TableHead>
                <TableHead scope="col" className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.entryNo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {entry.dateBs}
                  </TableCell>
                  <TableCell>
                    <span className="block truncate">
                      {entry.description || "—"}
                    </span>
                    {entry.createdBy ? (
                      <span className="text-xs text-muted-foreground">
                        {entry.createdBy}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNpr(entry.debit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNpr(entry.credit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
