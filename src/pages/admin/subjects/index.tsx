import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import { toast } from "sonner";
import ScreenLoader from "@/components/ui/screen-loader";
import { BsDatePicker } from "@/components/bs-datepicker";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import QUERY_KEYS from "@/lib/query-keys";
import type { T_SUBJECT } from "./service/service";

import { listSubjects, createSubject, updateSubject, deleteSubject } from "./service/service";

const LIMIT = 10;

export default function AdminSubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SUBJECT_LIST, search, page],
    queryFn: () => listSubjects({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_SUBJECT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const head: T_TableHead<T_SUBJECT>[] = [
    { key: "code", headName: "Code", minWidth: 180 },
    { key: "name", headName: "Name", minWidth: 260 },
    { key: "creditHours", headName: "Credit Hours", minWidth: 140 },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Subjects"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Subjects", link: "/admin/subjects" }]}
        createPage="/admin/subjects?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search subjects..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Subject</Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(s) => `/admin/subjects?mode=edit&id=${s.id}`}
        onDelete={(s) => console.log("delete subject", s.id)}
        onSearch={setSearch}
        emptyTitle="No subjects found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search subjects..."
      />

      {createOpen && <SimpleFormDialog mode="create" onClose={() => setCreateOpen(false)} fields={[
        { key: "code", label: "Code *", type: "text", required: true, placeholder: "Auto or custom code" },
        { key: "name", label: "Name *", type: "text", required: true, placeholder: "Enter subject name" },
        { key: "creditHours", label: "Credit Hours", type: "number", placeholder: "Enter credit hours" },
      ]} submitText="Create" service={async (vals) => ({ message: "" })} />}
    </div>
  );
}

function SimpleFormDialog({ fields, mode, onClose, submitText, service }: {
  mode: "create" | "edit";
  onClose: () => void;
  submitText?: string;
  fields: { key: string; label: string; type?: "number" | "text" | "bs-date"; required?: boolean; placeholder?: string }[];
  service: (vals: Record<string, string>) => Promise<{ message?: string }>;
}) {
  return <SubjectFormDialog mode={mode} onClose={onClose} submitText={submitText ?? "Save"} fields={fields} service={service} />;
}

function SubjectFormDialog({ mode, onClose, submitText, fields, service }: {
  mode: "create" | "edit";
  onClose: () => void;
  submitText: string;
  fields: { key: string; label: string; type?: "number" | "text" | "bs-date"; required?: boolean; placeholder?: string }[];
  service: (vals: Record<string, string>) => Promise<{ message?: string }>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: async () => { await service(values); },
    onSuccess: () => { toast.success("Saved"); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-3">
        <h3 className="font-semibold">{mode === "create" ? "Create Subject" : "Update Subject"}</h3>
        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">{f.label}{f.required && <span className="text-destructive"> *</span>}</label>
              {f.type === "bs-date" ? (
                <BsDatePicker value={values[f.key] ?? ""} valueFormat="bs" lang="en"
                  onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: typeof v === "string" ? v : "" }))} />
              ) : (
                <input type={f.type ?? "text"} value={values[f.key] ?? ""} placeholder={f.placeholder ?? ""}
                  className="w-full rounded border px-3 py-2 text-sm"
                  required={f.required}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Saving..." : submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}

