import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addPayment, cancelReceipt } from "../service/service";

interface SplitPaymentDialogProps {
  onClose: () => void;
  paymentId?: string; // for cancel dialog instead of create
  receiptId?: string;
}

export default function SplitPaymentDialog({ onClose, paymentId, receiptId }: SplitPaymentDialogProps) {
  const isCancel = !!paymentId || !!receiptId;

  const handleSubmit = async () => {
    if (receiptId) {
      await cancelReceipt(receiptId!, "Wrong receipt — cancelled");
      toast.success("Receipt cancelled & reversed");
      onClose();
    } else if (paymentId) {
      toast.info("Payment edit (append-only cancel only)");
      onClose();
    } else {
      toast.success("Payment recorded");
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCancel ? "Cancel Receipt" : "Record Payment"} · {paymentId ? "Edit Payment" : "New Payment"}</DialogTitle>
          <DialogDescription>
            {isCancel
              ? "Wrong receipt — cancel creates a reversal entry. Never edit or delete."
              : "Enter the total and split across payment methods (must equal the total)."}{" "}
            <span className="text-xs font-normal text-muted-foreground">Status is append-only after creation.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {!isCancel && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Total Amount ( NPR ) *</label>
                <Input type="number" value="" placeholder="Enter total amount" className="w-40" disabled={!!paymentId} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Method Lines (split) *</label>
                {/* Split list */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-muted-foreground">Method Code</label>
                    <select className="w-full rounded border px-2 py-1 text-sm" defaultValue="">
                      <option value="">Select</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank Transfer</option>
                      <option value="ONLINE">Online</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-muted-foreground">Amount *</label>
                    <Input type="number" className="w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-muted-foreground">Ref No.</label>
                    <Input className="w-full" placeholder="Reference number" />
                  </div>
                </div>
              </div>
            </>
          )}
          {isCancel && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Reason (required for cancellation) *</label>
              <textarea value="" placeholder="Explain why this receipt is being cancelled..." className="w-full rounded border px-3 py-2 text-sm" required />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="sm" disabled={!isCancel || !paymentId}
            onClick={async () => { await handleSubmit(); }}>
            {isCancel ? "Reverse Receipt" : "Save Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
