import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createNotice } from "../service/service";

interface NoticeDialogProps {
  mode: "create" | "edit";
  onClose: () => void;
  noticeId?: string;
  initial?: { title: string; content: string };
}

export default function NewNoticeDialog({ mode, onClose, noticeId, initial }: NoticeDialogProps) {
  const [form, setForm] = useState({ title: initial?.title ?? "", content: initial?.content ?? "" });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") return createNotice(form);
      // edit path — backend endpoint PUT /api/notices/:id
      return await fetch(`/api${`notices/${noticeId}`}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notices"] }); toast.success("Saved"); onClose(); },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Notice" : "Edit Notice"}</DialogTitle>
          <DialogDescription>Draft or publish a system notice.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8}
              placeholder="Enter notice content..." className="w-full rounded border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!form.title || !form.content || mutation.isPending}
            onClick={async () => { await mutation.mutateAsync(); }}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}