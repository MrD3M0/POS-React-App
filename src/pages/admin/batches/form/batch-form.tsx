import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBatch, updateBatch } from "../service/service";
import type { T_BATCH } from "../service/service";

interface BatchFormProps {
  mode: "create" | "edit";
  onClose: () => void;
  initial?: T_BATCH;
  batchId?: string;
}

export default function BatchFormDialog({ mode, onClose, initial, batchId }: BatchFormProps) {
  const [form, setForm] = useState({ name: initial?.name ?? "", currentTermNumber: initial?.currentTermNumber ?? 1, isActive: true });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") return createBatch(form);
      if (batchId) return updateBatch(batchId, form);
    },
    onSuccess: () => { toast.success("Saved"); onClose(); },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  const handleSubmit = () => mutation.mutate();

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Batch" : "Update Batch"}</DialogTitle>
          <DialogDescription>Enter batch details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Current Term Number *</label>
            <Input type="number" value={form.currentTermNumber} onChange={(e) => setForm({ ...form, currentTermNumber: Number(e.target.value) })} />
          </div>
          <div className="flex items-center space-x-2">
            <label className="block text-xs font-medium text-muted-foreground">Is Active</label>
            <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`rounded px-2 py-0.5 text-xs ${form.isActive ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {form.isActive ? "Yes" : "No"}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!form.name || mutation.isPending} onClick={handleSubmit}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}