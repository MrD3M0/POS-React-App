import { useState } from "react";
import Button  from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName?: string;
  onDelete: (id: string) => Promise<{ message: string }>;
  onSuccess?: () => void;
}

export default function ConfirmDeleteDialog({ open, onOpenChange, itemId, itemName, onDelete, onSuccess }: ConfirmDeleteDialogProps) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>{itemName ?? "This record"} will be permanently deleted.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <textarea
            placeholder="Reason (for audit trail)"
            className="w-full rounded border px-3 py-2 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">This action is audited. Provide a reason when deleting.</p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" disabled={!reason.trim()}
            onClick={async () => { await onDelete(itemId); if (!onOpenChange(false)) {} }}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}