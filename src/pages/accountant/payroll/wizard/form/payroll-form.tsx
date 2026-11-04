import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generatePayroll } from "../service/service";

interface PayrollFormDialogProps {
  mode: "create" | "edit";
  onClose: () => void;
  month: string;
  monthYear?: string;
}

export default function PayrollFormDialog({ mode, onClose, month }: PayrollFormDialogProps) {
  const [empId, setEmpId] = useState("");
  const [daysAttended, setDaysAttended] = useState(20);
  const [leaveDays, setLeaveDays] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [teachingPay, setTeachingPay] = useState(0);
  const [ssfDeduction, setSsfDeduction] = useState(0);
  const [pfDeduction, setPfDeduction] = useState(0);
  const [citDeduction, setCitDeduction] = useState(0);
  const [taxDeduction, setTaxDeduction] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const mutation = async () => {
    setSubmitting(true);
    try {
      await generatePayroll({
        month, employeeId: empId, daysAttended, leaveDays, allowances, teachingPay,
        ssfDeduction, pfDeduction, citDeduction, taxDeduction,
      });
      toast.success("Payroll generated — submitted for Principal approval");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Payroll — {month}</DialogTitle>
          <DialogDescription>Pull attendance, salary, SSF, PF, CIT &amp; tax. Adjust items then submit to Principal.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Employee ID *</Label>
              <Input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="Enter employee ID" />
            </div>
            <div className="space-y-1">
              <Label>Month (BS)</Label>
              <Input value={month} readOnly disabled />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Days Attended</Label>
            <Input type="number" value={daysAttended} onChange={(e) => setDaysAttended(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Leave Days</Label>
              <Input type="number" value={leaveDays} onChange={(e) => setLeaveDays(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Allowances ( NPR )</Label>
              <Input type="number" value={allowances} onChange={(e) => setAllowances(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teaching Pay ( NPR )</Label>
              <Input type="number" value={teachingPay} onChange={(e) => setTeachingPay(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>SSF Deduction</Label>
              <Input type="number" value={ssfDeduction} onChange={(e) => setSsfDeduction(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>PF Deduction</Label>
              <Input type="number" value={pfDeduction} onChange={(e) => setPfDeduction(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>CIT Deduction</Label>
              <Input type="number" value={citDeduction} onChange={(e) => setCitDeduction(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tax Deduction (NPR)</Label>
            <Input type="number" value={taxDeduction} onChange={(e) => setTaxDeduction(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!empId || submitting} onClick={mutation}>
            {submitting ? "Generating..." : "Generate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}