import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import {
  assignFeeStructureToStudent,
  createFeeStructure,
  listBatchOptions,
  listFeeHeadOptions,
  listStudentOptions,
} from "../service/service";
import {
  feeStructureAssignSchema,
  feeStructureCreateSchema,
  type FeeStructureAssignValues,
  type FeeStructureCreateValues,
} from "../schema/schema";

interface FeeStructureFormProps {
  mode: "create" | "assign";
  onClose: () => void;
  structureId?: string;
  initial?: { courseName: string; batchId?: string; termLabel: string };
}

function studentLabel(s: { id: string; universityRegNo?: string; firstName?: string; middleName?: string | null; lastName?: string }) {
  const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ").trim();
  return [name || s.id, s.universityRegNo ? `(${s.universityRegNo})` : ""].filter(Boolean).join(" ");
}

export default function FeeStructureFormDialog({ mode, onClose, structureId, initial }: FeeStructureFormProps) {
  const qc = useQueryClient();
  const isAssign = mode === "assign";

  const createForm = useForm<FeeStructureCreateValues>({
    resolver: zodResolver(feeStructureCreateSchema),
    defaultValues: {
      courseName: initial?.courseName ?? "",
      batchId: initial?.batchId ?? "",
      termLabel: initial?.termLabel ?? "",
      feeHeadCode: "",
      amount: 0,
    },
  });

  const assignForm = useForm<FeeStructureAssignValues>({
    resolver: zodResolver(feeStructureAssignSchema),
    defaultValues: { studentId: "" },
  });

  const studentsQuery = useQuery({
    queryKey: ["accountant-student-options", "unlimited"],
    queryFn: listStudentOptions,
    enabled: isAssign,
  });
  const batchesQuery = useQuery({
    queryKey: ["admin-batch-options", "unlimited"],
    queryFn: listBatchOptions,
    enabled: !isAssign,
  });
  const feeHeadsQuery = useQuery({
    queryKey: ["admin-fee-head-options", "unlimited"],
    queryFn: listFeeHeadOptions,
    enabled: !isAssign,
  });

  const studentOptions = (studentsQuery.data?.data?.data ?? []).map((s) => ({
    label: studentLabel(s),
    value: s.id,
    searchValues: studentLabel(s),
  }));
  const batchOptions = (batchesQuery.data?.data?.data ?? []).map((b) => ({
    label: [b.name, b.batchYear ? `(${b.batchYear})` : ""].filter(Boolean).join(" ") || b.id,
    value: b.id,
    searchValues: `${b.name ?? ""} ${b.batchYear ?? ""}`,
  }));
  const feeHeadOptions = (feeHeadsQuery.data?.data?.data ?? []).map((h) => ({
    label: [h.code, h.name].filter(Boolean).join(" - ") || h.id,
    value: h.code ?? h.id,
    searchValues: `${h.code ?? ""} ${h.name ?? ""}`,
  }));

  const createMutation = useMutation({
    mutationFn: (data: FeeStructureCreateValues) =>
      createFeeStructure({
        courseName: data.courseName.trim(),
        batchId: data.batchId?.trim() || undefined,
        termLabel: data.termLabel.trim(),
        feeHeadCode: data.feeHeadCode.trim(),
        amount: Number(data.amount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
      qc.invalidateQueries({ queryKey: ["accountant-fee-structures"] });
      toast.success("Fee structure created successfully.");
      onClose();
    },
    onError: () => toast.error("Failed to save fee structure. Please try again."),
  });

  const assignMutation = useMutation({
    mutationFn: (data: FeeStructureAssignValues) => {
      if (!structureId) throw new Error("Missing fee structure");
      return assignFeeStructureToStudent({ studentId: data.studentId, feeStructureId: structureId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
      qc.invalidateQueries({ queryKey: ["accountant-fee-structures"] });
      qc.invalidateQueries({ queryKey: ["accountant-student-fees"] });
      toast.success("Fee structure assigned successfully.");
      onClose();
    },
    onError: () => toast.error("Failed to assign fee structure. Please try again."),
  });

  const isPending = createMutation.isPending || assignMutation.isPending;

  return (
    <Dialog open onOpenChange={(o) => !o && !isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAssign ? "Assign Fee Structure" : "New Fee Structure"}</DialogTitle>
          <DialogDescription>
            {isAssign
              ? "Select a student to assign this fee structure to."
              : "Define the fee head and amount for a course/batch term."}
          </DialogDescription>
        </DialogHeader>

        {isAssign ? (
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit((data) => assignMutation.mutate(data))} className="space-y-4">
              <FormField
                control={assignForm.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={studentOptions}
                        placeholder={studentsQuery.isLoading ? "Loading students..." : "Select student..."}
                        searchPlaceholder="Search students..."
                        loading={studentsQuery.isLoading}
                      />
                    </FormControl>
                    <FormDescription>Select the student (ID reference, unlimited options loaded).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" loading={isPending} disabled={!structureId}>Assign</Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={createForm.control} name="courseName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Course/program name for this structure.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="batchId" render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Batch</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={[{ label: "None", value: "" }, ...batchOptions]}
                        placeholder={batchesQuery.isLoading ? "Loading batches..." : "Select batch (optional)..."}
                        searchPlaceholder="Search batches..."
                        loading={batchesQuery.isLoading}
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Optional batch reference (ID, unlimited options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={createForm.control} name="termLabel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Term Label</FormLabel>
                  <FormControl><Input placeholder="e.g. First Semester" {...field} /></FormControl>
                  <FormDescription>Term/semester label.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="feeHeadCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Head</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={feeHeadOptions}
                      placeholder={feeHeadsQuery.isLoading ? "Loading fee heads..." : "Select fee head..."}
                      searchPlaceholder="Search fee heads..."
                      loading={feeHeadsQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Select fee head code (unlimited options).</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (NPR)</FormLabel>
                  <FormControl><Input type="number" min={0} step="0.01" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} /></FormControl>
                  <FormDescription>Fee amount for this head.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" loading={isPending}>Save</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
