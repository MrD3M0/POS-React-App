import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFiscalYear, updateFiscalYear } from "../service/service";
import type { T_FY } from "../service/service";

interface FiscalYearFormProps {
  mode: "create" | "edit";
  onClose: () => void;
  initial?: T_FY;
  id?: string;
}

export default function FiscalYearFormDialog({ mode, onClose, initial, id }: FiscalYearFormProps) {
  const [form, setForm] = useState({ year: initial?.year ?? "", startDateBs: initial?.startDateBs ?? "", endDateBs: initial?.endDateBs ?? "" });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") return createFiscalYear(form);
      return updateFiscalYear(id!, form);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FISCALYEAR_LIST] }); toast.success("Saved"); onClose(); },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Fiscal Year" : "Update Fiscal Year"}</DialogTitle>
          <DialogDescription>Create a closed or open fiscal year.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Year *</label>
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2026/07 — 2027/06" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Start Date (BS)</label>
            <Input value={form.startDateBs} onChange={(e) => setForm({ ...form, startDateBs: e.target.value })} placeholder="YYYY-MM-DD" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">End Date (BS)</label>
            <Input value={form.endDateBs} onChange={(e) => setForm({ ...form, endDateBs: e.target.value })} placeholder="YYYY-MM-DD" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!form.year || mutation.isPending}
            onClick={async () => { await mutation.mutateAsync(); }}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}