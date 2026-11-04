import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFeeStructure } from "../service/service";

interface FeeStructureFormProps {
  mode: "create" | "assign";
  onClose: () => void;
  structureId?: string;
  initial?: { courseName: string; batchId?: string; termLabel: string };
}

export default function FeeStructureFormDialog({ mode, onClose, structureId, initial }: FeeStructureFormProps) {
  const [form, setForm] = useState({
    courseName: initial?.courseName ?? "",
    batchId: initial?.batchId ?? "",
    termLabel: initial?.termLabel ?? "",
    feeHeadCode: "",
    amount: 0,
  });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") {
        await createFeeStructure(form);
      } else if (structureId) {
        // assign fee structure to a student / batch
        await fetch(`/accountant/fee-structures/${structureId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` },
          body: JSON.stringify({ ...form, studentId: "", batchId: form.batchId || "" }),
        });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee-structures"] }); toast.success("Saved"); onClose(); },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Fee Structure" : "Assign Fee Structure"}</DialogTitle>
          <DialogDescription>Enter fee head and amount per semester or year.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Course Name *</label>
              <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Batch ID</label>
              <Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} placeholder="Leave blank if no batch" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Term Label *</label>
            <Input value={form.termLabel} onChange={(e) => setForm({ ...form, termLabel: e.target.value })} placeholder="e.g. First Semester" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Fee Head Code *</label>
            <Input value={form.feeHeadCode} onChange={(e) => setForm({ ...form, feeHeadCode: e.target.value })} placeholder="e.g. TUREGA" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Amount ( NPR ) *</label>
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!form.courseName || !form.feeHeadCode || form.amount <= 0 || mutation.isPending}
            onClick={async () => { await mutation.mutateAsync(); }}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}