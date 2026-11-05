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
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_TERM } from "./service/service";

import { listTerms, createTerm, updateTerm, deleteTerm } from "./service/service";

const LIMIT = 10;

export default function AdminTermsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_LIST, search, page],
    queryFn: () => listTerms({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_TERM[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const head: T_TableHead<T_TERM>[] = [
    { key: "termNumber", headName: "#", minWidth: 60 },
    { key: "name", headName: "Name", minWidth: 220 },
    { key: "startDateBs", headName: "Start Date", minWidth: 180 },
    { key: "endDateBs", headName: "End Date", minWidth: 180 },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Terms"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Terms", link: "/admin/terms" }]}
        createPage="/admin/terms?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search terms..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Term</Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(t) => `/admin/terms?mode=edit&id=${t.id}`}
        onDelete={(t) => console.log("delete term", t.id)}
        onSearch={setSearch}
        emptyTitle="No terms found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search terms..."
      />

      {createOpen && <SimpleFormDialog mode="create" onClose={() => setCreateOpen(false)} fields={[
        { key: "termNumber", label: "Term Number *", type: "number", required: true, placeholder: "Enter number" },
        { key: "name", label: "Name *", type: "text", required: true, placeholder: "Enter term name (e.g. First Semester)" },
        { key: "startDateBs", label: "Start Date (BS)", type: "bs-date", required: true, placeholder: "YYYY-MM-DD" },
        { key: "endDateBs", label: "End Date (BS)", type: "bs-date", required: true, placeholder: "YYYY-MM-DD" },
      ]} submitText="Create" service={async (vals) => ({ message: "" })} />}

      {editId && <SimpleFormDialog mode="edit" id={editId} initial={rows.find((r) => r.id === editId)} onClose={() => setEditId(null)} fields={[
        { key: "termNumber", label: "Term Number", type: "number", placeholder: "Enter number" },
        { key: "name", label: "Name", type: "text", placeholder: "Enter term name" },
        { key: "startDateBs", label: "Start Date (BS)", type: "bs-date", placeholder: "YYYY-MM-DD" },
        { key: "endDateBs", label: "End Date (BS)", type: "bs-date", placeholder: "YYYY-MM-DD" },
      ]} submitText="Update" service={async (vals) => ({ message: "" })} />}
    </div>
  );
}

// --- Simple form dialog helper ---
function SimpleFormDialog({ fields, mode, onClose, submitText, service, id, initial }: {
  mode: "create" | "edit";
  onClose: () => void;
  submitText?: string;
  fields: { key: string; label: string; type?: "number" | "text" | "bs-date"; required?: boolean; placeholder?: string }[];
  service: (vals: Record<string, string>) => Promise<{ message?: string }>;
  id?: string;
  initial?: { [k: string]: unknown };
}) {
  return <TermFormDialog mode={mode} id={id} initial={initial} fields={fields} onClose={onClose} submitText={submitText ?? "Save"} service={service} />;
}

function TermFormDialog({ mode, id, initial, fields, onClose, submitText, service }: {
  mode: "create" | "edit";
  id?: string;
  initial?: { [k: string]: unknown };
  fields: { key: string; label: string; type?: "number" | "text" | "bs-date"; required?: boolean; placeholder?: string }[];
  onClose: () => void;
  submitText: string;
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
        <h3 className="font-semibold">{mode === "create" ? "Create Term" : "Update Term"}</h3>
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

