import { useState } from "react";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface NewItemDialogProps {
  title: string;
  fields: { key: string; label: string; type?: "text" | "select"; options?: string[]; placeholder?: string; required?: boolean }[];
  onSubmit: (values: Record<string, string>) => Promise<{ message?: string }>;
  onClose: () => void;
  submitText?: string;
}

export default function NewItemDialog({ title, fields, onSubmit, onClose, submitText = "Create" }: NewItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const reset = () => setValues({});

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await onSubmit(values);
      toast.success(result?.message ?? "Success");
      reset();
      setOpen(false);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>New</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Fill in the required details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">{f.label}{f.required && <span className="text-destructive"> *</span>}</label>
                <Input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder ?? `Enter ${f.label}`}
                  value={values[f.key] ?? ""}
                  required={f.required}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={submitting || !fields.every((f) => values[f.key])}
              onClick={handleSubmit}>
              {submitting ? "Saving..." : submitText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
