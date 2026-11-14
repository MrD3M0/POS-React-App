import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import Button from "@/components/ui/button";
import SelectCommand from "@/components/select-command";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  assignFeeStructureToStudent,
  assignFeeStructureToStudents,
  listBatchOptions,
  listStudentOptions,
  type T_FEE_STRUCTURE,
} from "../service/service";

/**
 * Assigns a fee structure to a student or to a whole batch — this is how the
 * college fees reach the students (right after admission).
 */
export default function AssignFeeStructureDialog({
  open,
  onOpenChange,
  structure,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structure: T_FEE_STRUCTURE | null;
  mode: "student" | "batch";
}) {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [batchId, setBatchId] = useState("");

  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_STUDENTS],
    queryFn: () => listStudentOptions(),
    enabled: open && mode === "student",
  });
  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_BATCHES, "assign"],
    queryFn: () => listBatchOptions(),
    enabled: open && mode === "batch",
  });

  const singleMut = useMutation({
    mutationFn: () =>
      assignFeeStructureToStudent({
        studentId,
        feeStructureId: structure?.id ?? "",
      }),
    onSuccess: () => {
      toast.success("Fee structure assigned to the student.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
      setStudentId("");
      onOpenChange(false);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to assign the fee structure.",
      );
    },
  });

  const bulkMut = useMutation({
    mutationFn: () =>
      assignFeeStructureToStudents({
        feeStructureId: structure?.id,
        batchId,
      }),
    onSuccess: (data) => {
      const result = data?.data as
        | { assigned: number; skipped: number; failed: number }
        | undefined;
      toast.success(
        result
          ? `Assigned to ${result.assigned} student(s), ${result.skipped} already had it.`
          : "Fee structures assigned.",
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
      setBatchId("");
      onOpenChange(false);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to assign the fee structure.",
      );
    },
  });

  const studentOptions = (
    studentsQuery.data?.data?.data ?? []
  ).map((student) => ({
    label: `${student.universityRegNo ?? ""} — ${[
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ")}`,
    value: student.id,
    searchValues: `${student.universityRegNo ?? ""} ${student.firstName ?? ""} ${
      student.lastName ?? ""
    }`,
  }));

  const batchOptions = (batchesQuery.data?.data?.data ?? []).map((batch) => ({
    label: batch.name,
    value: batch.id,
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setStudentId("");
          setBatchId("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "student"
              ? "Assign Fee Structure to a Student"
              : "Assign Fee Structure to a Batch"}
          </DialogTitle>
          <DialogDescription>
            {structure?.name ?? "Fee structure"} — the fee items are copied to
            the student&apos;s fee, so the dues appear right away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {mode === "student" ? (
            <div className="space-y-2">
              <Label htmlFor="assign-student">Student</Label>
              <SelectCommand
                value={studentId}
                onChange={setStudentId}
                options={studentOptions}
                placeholder="Select student..."
                searchPlaceholder="Search by name or reg no..."
                loading={studentsQuery.isLoading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="assign-batch">Batch</Label>
              <SelectCommand
                value={batchId}
                onChange={setBatchId}
                options={batchOptions}
                placeholder="Select batch..."
                searchPlaceholder="Search batches..."
                loading={batchesQuery.isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Every student of the batch that does not have this structure yet
                gets it.
              </p>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={singleMut.isPending || bulkMut.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={mode === "student" ? singleMut.isPending : bulkMut.isPending}
              disabled={
                mode === "student" ? !studentId : !batchId
              }
              onClick={() => {
                if (mode === "student") singleMut.mutate();
                else bulkMut.mutate();
              }}
            >
              {mode === "student" ? "Assign" : "Assign to Batch"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
