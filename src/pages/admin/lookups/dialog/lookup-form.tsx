import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLookup } from "../service/service";

interface LookupFormProps {
  type: string;
  onClose: () => void;
}

export default function LookupFormDialog({ type, onClose }: LookupFormProps) {
  const [form, setForm] = useState({ code: "", name: "", active: true });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => createLookup({ ...form, type }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lookup"] }); toast.success("Created"); onClose(); },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New {type} Lookup</DialogTitle>
          <DialogDescription>Enter a code and name for the lookup entry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Code *</label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. VACATION" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter name" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!form.code || !form.name || mutation.isPending}
            onClick={async () => { await mutation.mutateAsync(); }}>
            {mutation.isPending ? "Saving..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}