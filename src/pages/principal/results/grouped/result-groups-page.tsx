import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  Send,
  UploadCloud,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import SelectCommand from "@/components/common/select-command";
import NoData from "@/components/common/no-data";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listResultGroups,
  publishResultGroups,
  reviewResultGroups,
  type TResultGroup,
  type TResultGroupStatus,
} from "./service";

type TMode = "review" | "publish";

type TGroupBlock = {
  key: string;
  batchId: string;
  batchName: string;
  termId: string;
  termName: string;
  rows: TResultGroup[];
  studentsCount: number;
  passPercent: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
};

const STATUS_LABEL: Record<TResultGroupStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function statusVariant(status: TResultGroupStatus) {
  if (status === "APPROVED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "REJECTED") return "destructive" as const;
  return "outline" as const;
}

function toErrorMessage(error: unknown): string {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return message ?? "The action could not be completed.";
}

/** Group rows by Batch + Term and aggregate the numbers shown on the card. */
function buildGroups(rows: TResultGroup[], status: string): TGroupBlock[] {
  const filtered =
    status === "ALL" ? rows : rows.filter((row) => row.status === status);
  const map = new Map<string, TGroupBlock>();

  for (const row of filtered) {
    const key = `${row.batchId}:${row.termId}`;
    let block = map.get(key);
    if (!block) {
      block = {
        key,
        batchId: row.batchId,
        batchName: row.batchName,
        termId: row.termId,
        termName: row.termName,
        rows: [],
        studentsCount: 0,
        passPercent: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        draft: 0,
      };
      map.set(key, block);
    }
    block.rows.push(row);
    block.studentsCount = Math.max(block.studentsCount, row.studentsCount);
    if (row.status === "PENDING") block.pending += 1;
    else if (row.status === "APPROVED") block.approved += 1;
    else if (row.status === "REJECTED") block.rejected += 1;
    else block.draft += 1;
  }

  return [...map.values()]
    .map((block) => {
      const measured = block.rows.filter((row) => row.marksEntered > 0);
      const passPercent =
        measured.length > 0
          ? measured.reduce((sum, row) => sum + row.passPercent, 0) /
            measured.length
          : 0;
      return { ...block, passPercent: Math.round(passPercent * 10) / 10 };
    })
    .sort((a, b) =>
      `${a.batchName} ${a.termName}`.localeCompare(`${b.batchName} ${b.termName}`),
    );
}

/**
 * Shared Batch -> Term -> Subject review screen.
 *
 * `review` mode = principal approves/rejects the submitted subjects of a group;
 * `publish` mode = publishes a Batch + Term once every subject is approved.
 * Per-student approve buttons are intentionally gone.
 */
export default function ResultGroupsPage({ mode }: { mode: TMode }) {
  const qc = useQueryClient();
  const [batchId, setBatchId] = useState("ALL");
  const [termId, setTermId] = useState("ALL");
  const [subjectId, setSubjectId] = useState("ALL");
  const [status, setStatus] = useState(mode === "review" ? "PENDING" : "ALL");
  const [rejectTarget, setRejectTarget] = useState<TGroupBlock | null>(null);
  const [reason, setReason] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_RESULT_GROUPS, mode],
    queryFn: () => listResultGroups({}),
    staleTime: 30_000,
  });

  const allRows = useMemo(() => query.data?.groups ?? [], [query.data]);

  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of allRows) map.set(row.batchId, row.batchName);
    return [
      { label: "All batches", value: "ALL" },
      ...[...map.entries()].map(([value, label]) => ({ value, label })),
    ];
  }, [allRows]);

  const termOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of allRows) {
      if (batchId !== "ALL" && row.batchId !== batchId) continue;
      map.set(row.termId, row.termName);
    }
    return [
      { label: "All terms", value: "ALL" },
      ...[...map.entries()].map(([value, label]) => ({ value, label })),
    ];
  }, [allRows, batchId]);

  const subjectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of allRows) {
      if (batchId !== "ALL" && row.batchId !== batchId) continue;
      if (termId !== "ALL" && row.termId !== termId) continue;
      map.set(row.subjectId, row.subjectName);
    }
    return [
      { label: "All subjects", value: "ALL" },
      ...[...map.entries()].map(([value, label]) => ({ value, label })),
    ];
  }, [allRows, batchId, termId]);

  const scopeRows = useMemo(
    () =>
      allRows.filter(
        (row) =>
          (batchId === "ALL" || row.batchId === batchId) &&
          (termId === "ALL" || row.termId === termId) &&
          (subjectId === "ALL" || row.subjectId === subjectId),
      ),
    [allRows, batchId, termId, subjectId],
  );

  const groups = useMemo(
    () => buildGroups(scopeRows, mode === "review" ? status : "ALL"),
    [scopeRows, status, mode],
  );

  const pendingTotal = scopeRows.filter((row) => row.status === "PENDING").length;
  const rejectedTotal = scopeRows.filter(
    (row) => row.status === "REJECTED",
  ).length;
  const approvedTotal = scopeRows.filter(
    (row) => row.status === "APPROVED",
  ).length;
  const readyGroups = useMemo(
    () =>
      groups.filter(
        (group) =>
          group.rows.length > 0 &&
          group.rows.every((row) => row.status === "APPROVED"),
      ).length,
    [groups],
  );

  const reviewMut = useMutation({
    mutationFn: reviewResultGroups,
    onSuccess: (data) => {
      toast.success(
        `${data?.updated ?? 0} subject(s) ${
          data?.action === "REJECT" ? "rejected" : "approved"
        }.`,
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_RESULT_GROUPS] });
      setRejectTarget(null);
      setReason("");
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const publishMut = useMutation({
    mutationFn: publishResultGroups,
    onSuccess: (data) => {
      toast.success(
        `Published ${data?.published ?? 0} result row(s) for this Batch + Term.`,
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_RESULT_GROUPS] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const retry = () => void query.refetch();

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const approveGroup = (group: TGroupBlock) =>
    reviewMut.mutate({
      action: "APPROVE",
      batchId: group.batchId,
      termId: group.termId,
      subjectId: subjectId === "ALL" ? undefined : subjectId,
    });

  const rejectGroup = () => {
    if (!rejectTarget) return;
    if (!reason.trim()) {
      toast.error("A rejection reason is required.");
      return;
    }
    reviewMut.mutate({
      action: "REJECT",
      batchId: rejectTarget.batchId,
      termId: rejectTarget.termId,
      subjectId: subjectId === "ALL" ? undefined : subjectId,
      reason: reason.trim(),
    });
  };

  const publishGroup = (group: TGroupBlock) =>
    publishMut.mutate({ batchId: group.batchId, termId: group.termId });

  return (
    <div className="p-5">
      <PageHeader
        title={mode === "review" ? "Pending Results" : "Publish Results"}
        description={
          mode === "review"
            ? "Approve or reject the marks teachers submitted, one Batch → Term → Subject group at a time."
            : "Publish a Batch → Term once every subject of that term is approved."
        }
        breadCrumbItems={[
          { title: "Principal", link: "/principal" },
          {
            title: mode === "review" ? "Pending Results" : "Publish Results",
            link:
              mode === "review"
                ? "/principal/results/pending"
                : "/principal/results/publish",
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            loading={query.isFetching}
          >
            {!query.isFetching ? <RefreshCw className="size-3.5" /> : null}
            Refresh
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Batch</p>
            <SelectCommand
              options={batchOptions}
              value={batchId}
              onChange={(value) => {
                setBatchId(value);
                setTermId("ALL");
                setSubjectId("ALL");
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Term</p>
            <SelectCommand
              options={termOptions}
              value={termId}
              onChange={(value) => {
                setTermId(value);
                setSubjectId("ALL");
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Subject</p>
            <SelectCommand
              options={subjectOptions}
              value={subjectId}
              onChange={setSubjectId}
            />
          </div>
          {mode === "review" ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <SelectCommand
                options={[
                  { label: "Needs review (pending)", value: "PENDING" },
                  { label: "Rejected", value: "REJECTED" },
                  { label: "Approved", value: "APPROVED" },
                  { label: "Draft", value: "DRAFT" },
                  { label: "All statuses", value: "ALL" },
                ]}
                value={status}
                onChange={setStatus}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
              {readyGroups} of {groups.length} Batch + Term group(s) ready to
              publish.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            key: "pending",
            label: "Pending subjects",
            value: pendingTotal,
            icon: ClipboardCheck,
          },
          {
            key: "approved",
            label: "Approved subjects",
            value: approvedTotal,
            icon: CheckCircle2,
          },
          {
            key: "rejected",
            label: "Rejected subjects",
            value: rejectedTotal,
            icon: XCircle,
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

      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoData
              title={
                mode === "review"
                  ? "Nothing waiting for approval"
                  : "No Batch + Term ready to publish"
              }
              description={
                mode === "review"
                  ? "When a teacher submits a subject's marks it appears here."
                  : "A Batch + Term appears here once every subject is approved."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const allApproved =
              group.rows.length > 0 &&
              group.rows.every((row) => row.status === "APPROVED");
            return (
              <Card key={group.key}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
                  <div>
                    <p className="font-semibold">
                      {group.batchName}
                      <span className="mx-1.5 text-muted-foreground">·</span>
                      {group.termName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {group.rows.length} subject(s) · {group.studentsCount}{" "}
                      students · average pass {group.passPercent.toFixed(1)}%
                      {group.rejected > 0
                        ? ` · ${group.rejected} rejected`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mode === "review" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveGroup(group)}
                          disabled={group.pending === 0 || reviewMut.isPending}
                        >
                          <CheckCircle2 className="size-3.5" />
                          Approve {group.pending > 0 ? group.pending : ""} pending
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReason("");
                            setRejectTarget(group);
                          }}
                          disabled={group.pending === 0 || reviewMut.isPending}
                        >
                          <XCircle className="size-3.5" />
                          Reject…
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => publishGroup(group)}
                        disabled={!allApproved || publishMut.isPending}
                        title={
                          allApproved
                            ? "Publish every result of this Batch + Term"
                            : "Every subject must be approved first"
                        }
                      >
                        <UploadCloud className="size-3.5" />
                        Publish results
                      </Button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Subject</th>
                        <th className="px-4 py-2 font-medium">Exam</th>
                        <th className="px-4 py-2 font-medium">Teacher</th>
                        <th className="px-4 py-2 text-right font-medium">
                          Students
                        </th>
                        <th className="px-4 py-2 text-right font-medium">
                          Marks
                        </th>
                        <th className="px-4 py-2 text-right font-medium">
                          Pass %
                        </th>
                        <th className="px-4 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="px-4 py-2">
                            <p className="font-medium">{row.subjectName}</p>
                            {row.subjectCode ? (
                              <p className="text-xs text-muted-foreground">
                                {row.subjectCode}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-2">{row.examName}</td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {row.teacherName ?? "—"}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums">
                            {row.studentsCount}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums">
                            {row.marksEntered}
                            {row.absentCount > 0
                              ? ` (${row.absentCount} absent)`
                              : ""}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums">
                            {row.passPercent.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant={statusVariant(row.status)}>
                              {STATUS_LABEL[row.status]}
                            </Badge>
                            {row.status === "REJECTED" &&
                            row.rejectionReason ? (
                              <p className="mt-1 max-w-56 text-xs text-destructive">
                                {row.rejectionReason}
                              </p>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject submitted marks</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `${rejectTarget.batchName} · ${rejectTarget.termName}. The teacher will see the reason and can re-submit.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium">Reason</p>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain what needs to be corrected…"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              A reason is required so the teacher knows what to fix.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRejectTarget(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={rejectGroup}
              disabled={!reason.trim() || reviewMut.isPending}
              loading={reviewMut.isPending}
            >
              <Send className="size-3.5" />
              Reject marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
