import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button  from "@/components/ui/button";
import { BsDatePicker } from "@/components/bs-datepicker";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createStudent } from "../service/service";

interface AddStudentDialogProps {
  mode: "create" | "edit";
  onClose: () => void;
}

export default function AddStudentDialog({ mode, onClose }: AddStudentDialogProps) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", universityRegNo: "", gender: "MALE",
    dobBs: "", batchId: "", phone: "", email: "", permanentAddress: "", temporaryAddress: "",
    guardianRelation: "FATHER", guardianName: "", guardianPhone: "", guardianEmail: "", guardianOccupation: "", guardianAddress: "",
  });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => createStudent(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-students"] }); toast.success("Student added — PENDING approval"); onClose(); },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Student (Pending)" : "Edit / Resubmit Student"}</DialogTitle>
          <DialogDescription>While PENDING or REJECTED you can edit. The student does not appear in attendance, fees, exams or results until Admin approves.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          <Field label="First Name *">
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Field>
          <Field label="Last Name *">
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
          <Field label="University Reg No *">
            <Input value={form.universityRegNo} onChange={(e) => setForm({ ...form, universityRegNo: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded border px-3 py-1 text-sm">
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHERS">Others</option>
              </select>
            </Field>
            <Field label="DOB (BS)">
              <BsDatePicker value={form.dobBs} onChange={(e) => setForm({ ...form, dobBs: e.target.value })} valueFormat="bs" lang="en" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Batch ID">
              <Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Permanent Address">
            <textarea value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} rows={2} className="w-full rounded border px-3 py-2 text-sm" />
          </Field>
          <Field label="Temporary Address">
            <textarea value={form.temporaryAddress} onChange={(e) => setForm({ ...form, temporaryAddress: e.target.value })} rows={2} className="w-full rounded border px-3 py-2 text-sm" />
          </Field>

          {/* Guardians */}
          <GuardianRow label={`${form.guardianRelation} Name`}>
            <Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
          </GuardianRow>
          <GuardianRow label="Phone">
            <Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
          </GuardianRow>
          <GuardianRow label="Email">
            <Input type="email" value={form.guardianEmail} onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })} />
          </GuardianRow>
          <GuardianRow label="Occupation">
            <Input value={form.guardianOccupation} onChange={(e) => setForm({ ...form, guardianOccupation: e.target.value })} />
          </GuardianRow>
          <GuardianRow label="Address">
            <Input value={form.guardianAddress} onChange={(e) => setForm({ ...form, guardianAddress: e.target.value })} />
          </GuardianRow>

          {mode === "edit" && <RejectionReasons reason={form.rejectionReason ?? ""} onUpdate={(v) => setForm({ ...form, rejectionReason: v })} />}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!form.firstName || !form.lastName || mutation.isPending}
            onClick={async () => { await mutation.mutateAsync(); }}>
            {mutation.isPending ? "Saving..." : mode === "create" ? "Add Student" : "Resubmit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
function GuardianRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <Field label={label}>{children}</Field>;
}
function RejectionReasons({ reason, onUpdate }: { reason: string; onUpdate: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">Rejection Reason (required if REJECTED)</Label>
      <textarea value={reason} onChange={(e) => onUpdate(e.target.value)} placeholder="Explain rejection... if any." rows={2} className="w-full rounded border px-3 py-2 text-sm" />
    </div>
  );
}

// --- Service ---
import { createStudent as createStudentFn, updateStudent as updateStudentFn } from "../service/service";
import { Input } from "@/components/ui/input";
void createStudentFn; void updateStudentFn;
