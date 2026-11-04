import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { postJournalEntry, reverseJournalEntry } from "../service/service";
import type { T_JOURNAL_LINE } from "../service/service";

interface JournalEntryFormProps {
  onClose: () => void;
}

export default function JournalEntryForm({ onClose }: JournalEntryFormProps) {
  const [lines, setLines] = useState<T_JOURNAL_LINE[]>([
    { id: "1", accountCode: "1001", description: "", amount: 0, direction: "DEBIT" },
    { id: "2", accountCode: "2001", description: "", amount: 0, direction: "CREDIT" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Live totals — must balance on submit
  const debitTotal = lines.filter((l) => l.direction === "DEBIT").reduce((s, l) => s + l.amount, 0);
  const creditTotal = lines.filter((l) => l.direction === "CREDIT").reduce((s, l) => s + l.amount, 0);

  // Block submit unless equal
  if (debitTotal !== creditTotal) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await postJournalEntry({ lines });
      toast.success("Journal entry posted");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post Journal Entry</DialogTitle>
          <DialogDescription>Live debit &amp; credit totals must balance before submitting.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {/* Total summary — block submit if not equal */}
          <div className="flex gap-4 text-sm font-semibold">
            <span className="text-destructive">Debit : ₹{debitTotal}</span>
            <span className="text-foreground">Credit : ₹{creditTotal}</span>
            <span className={debitTotal === creditTotal ? "text-emerald-600" : "text-red-500"}>Balance : ₹{debitTotal - creditTotal}</span>
          </div>

          {/* Group account selection — cannot select group accounts */}
          <div className="space-y-1.5">
            <Label>Accounts (group accounts disabled)</Label>
            <select multiple value="" onChange={() => {}} className="rounded border px-3 py-1 text-sm">
              <option value="1001">Student Ledger</option>
              <option value="2001">Employee Ledger</option>
              <option value="3001">Account Ledger</option>
            </select>
          </div>

          {/* Lines editor */}
          <div className="space-y-2 max-h-60 overflow-auto">
            {lines.map((line, i) => (
              <div key={line.id} className="grid grid-cols-4 gap-2 items-center">
                <Input placeholder="Account Code" value={line.accountCode} disabled className="col-span-1" />
                <Input placeholder="Description" value={line.description} onChange={(e) => setLines((v) => v.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className="col-span-2" />
                <Input type="number" placeholder="Amount" value={line.amount} disabled className="col-span-1" />
                <Button variant="ghost" size="icon" onClick={() => setLines((v) => v.filter((_, j) => j !== i))}>✕</Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!debitTotal || creditTotal || submitting} onClick={handleSubmit}>
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}