import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Send,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import NoData from "@/components/common/no-data";
import SelectCommand from "@/components/common/select-command";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listResultGroups,
  submitExamSubject,
  type TResultGroup,
  type TResultGroupStatus,
} from "@/pages/principal/results/grouped/service";

const STATUS_LABEL: Record<TResultGroupStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Waiting for principal",
  APPROVED: "Approved",
  REJECTED: "Rejected — fix and re-submit",
};

function statusVariant(status: TResultGroupStatus) {
  if (status === "APPROVED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "REJECTED") return "destructive" as const;
  return "outline" as const;
}

function toErrorMessage(error: unknown): string {
  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
          data?: Record<string, string[] | string>;
        };
      };
    }
  )?.response?.data;
  if (response?.data && typeof response.data === "object") {
    const first = Object.values(response.data)[0];
    const text = Array.isArray(first) ? first[0] : first;
    if (text) return String(text);
  }
  return response?.message ?? "Could not submit these marks.";
}

/**
 * Teacher side of the group workflow: one row per Batch + Term + Subject.
 * A subject can be submitted once every student has a mark (or is marked
 * absent); after a rejection the reason is shown and the teacher can
 * re-submit.
 */
export default function TeacherMarksSubmissionPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("NEEDS_ACTION");

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_RESULT_GROUPS],
    queryFn: () => listResultGroups({}),
    staleTime: 30_000,
  });

  const rows = useMemo(() => query.data?.groups ?? [], [query.data]);

  const visibleRows = useMemo(() => {
    if (status === "ALL") return rows;
    if (status === "NEEDS_ACTION") {
      return rows.filter(
        (row) => row.status === "DRAFT" || row.status === "REJECTED",
      );
    }
    return rows.filter((row) => row.status === status);
  }, [rows, status]);

  const submitMut = useMutation({
    mutationFn: (id: string) => submitExamSubject(id),
    onSuccess: () => {
      toast.success("Marks submitted to the principal for approval.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_RESULT_GROUPS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ROLE_DASHBOARD] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const retry = () => void query.refetch();

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const canSubmit = (row: TResultGroup) =>
    (row.status === "DRAFT" || row.status === "REJECTED") &&
    row.marksEntered > 0;

  const actionCount = rows.filter(
    (row) => row.status === "DRAFT" || row.status === "REJECTED",
  ).length;
  const rejectedCount = rows.filter((row) => row.status === "REJECTED").length;
  const pendingCount = rows.filter((row) => row.status === "PENDING").length;
  const approvedCount = rows.filter((row) => row.status === "APPROVED").length;

  return (
    <div className="p-5">
      <PageHeader
        title="Marks Submission"
        description="Submit each subject's marks to the principal. Rejected subjects show the reason and can be re-submitted."
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher/dashboard" },
          { title: "Marks Submission", link: "/teacher/marks/submit" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/teacher/marks">
                <ClipboardList className="size-3.5" />
                Enter marks
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              loading={query.isFetching}
            >
              {!query.isFetching ? <RefreshCw className="size-3.5" /> : null}
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: "action",
            label: "Needs your action",
            value: actionCount,
            icon: Send,
          },
          {
            key: "rejected",
            label: "Rejected",
            value: rejectedCount,
            icon: XCircle,
          },
          {
            key: "pending",
            label: "Waiting for principal",
            value: pendingCount,
            icon: RefreshCw,
          },
          {
            key: "approved",
            label: "Approved",
            value: approvedCount,
            icon: CheckCircle2,
          },
        ].map((item) => (
          <Card key={item.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xl font-semibold tabular-nums">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-xs space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <SelectCommand
              options={[
                { label: "Needs my action", value: "NEEDS_ACTION" },
                { label: "Rejected", value: "REJECTED" },
                { label: "Waiting for principal", value: "PENDING" },
                { label: "Approved", value: "APPROVED" },
                { label: "All subjects", value: "ALL" },
              ]}
              value={status}
              onChange={setStatus}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A subject needs a mark (or an Absent mark) for every student before
            it can be submitted.
          </p>
        </CardContent>
      </Card>

      {visibleRows.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoData
              title="Nothing to submit"
              description="All your subjects are either waiting for the principal or already approved."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleRows.map((row) => {
            const missing = Math.max(row.studentsCount - row.marksEntered, 0);
            return (
              <Card key={row.id}>
                <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{row.subjectName}</p>
                      <Badge variant={statusVariant(row.status)}>
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {row.batchName} · {row.termName} · {row.examName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.marksEntered} of {row.studentsCount} student(s) marked
                      {row.absentCount > 0
                        ? ` · ${row.absentCount} absent`
                        : ""}
                      {missing > 0 ? ` · ${missing} missing` : ""}
                    </p>
                    {row.status === "REJECTED" && row.rejectionReason ? (
                      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                        <span>
                          <span className="font-medium">
                            Principal's reason:
                          </span>{" "}
                          {row.rejectionReason}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/teacher/marks?examSubjectId=${row.id}`}
                      >
                        {row.status === "REJECTED" ? "Fix marks" : "Enter marks"}
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      disabled={!canSubmit(row) || submitMut.isPending}
                      loading={
                        submitMut.isPending && submitMut.variables === row.id
                      }
                      onClick={() => submitMut.mutate(row.id)}
                      title={
                        canSubmit(row)
                          ? "Submit these marks to the principal"
                          : row.status === "DRAFT" && row.marksEntered === 0
                            ? "Enter the marks first"
                            : row.status === "PENDING"
                              ? "Already waiting for the principal"
                              : row.status === "APPROVED"
                                ? "Already approved"
                                : "Enter a mark for every student first"
                      }
                    >
                      <Send className="size-3.5" />
                      {row.status === "REJECTED" ? "Re-submit" : "Submit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
