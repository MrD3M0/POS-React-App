import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import SelectCommand from "@/components/select-command";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listBatches, listTerms, deleteBatch, type T_BATCH, type T_TERM } from "./service/service";
import { listSubjects } from "@/pages/admin/subjects/service/service";
import type { T_SUBJECT } from "@/pages/admin/subjects/service/service";

export default function AcademicStructurePage() {
  const [tab, setTab] = useState<"batches" | "terms" | "subjects">("batches");
  return (
    <div className="p-5">
      <PageHeader
        title="Academic Structure"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Academic Structure", link: "/admin/batches" },
        ]}
      />
      <div className="flex flex-wrap gap-1 mb-4">
        {([["batches", "Batches"], ["terms", "Terms"], ["subjects", "Subjects"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded px-3 py-1 text-sm font-medium ${
              tab === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "batches" && <BatchesView />}
      {tab === "terms" && <TermsView />}
      {tab === "subjects" && <SubjectsView />}
    </div>
  );
}

function BatchesView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, search, page],
    queryFn: () => listBatches({ page, limit: 10, search }),
  });

  const rows: T_BATCH[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_BATCH>[] = [
    { key: "name", headName: "Batch Name" },
    {
      key: "courseId",
      headName: "Course",
      render: (b) => (b.course ? `${b.course.code} - ${b.course.name}` : b.courseId),
    },
    { key: "currentTermNumber", headName: "Current Term", render: (b) => `#${b.currentTermNumber}` },
    { key: "startDateBs", headName: "Start Date (BS)", render: (b) => b.startDateBs || "—" },
    {
      key: "isActive",
      headName: "Status",
      render: (b) => (
        <Badge variant={b.isActive ? "default" : "destructive"}>{b.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-base font-semibold">Batches</h3>
        <PageHeader
          title=""
          breadCrumbItems={[]}
          createPage="/admin/batches/create"
          createPageTitle="New Batch"
        />
      </div>
      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(b) => `/admin/batches/edit/${b.id}`}
        onDelete={(b) => setDeleteId(b.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No batches found."
        pagination={{ page, limit: 10, total, onPageChange: setPage }}
        searchPlaceholder="Search batches..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          itemName="Batch"
          onDelete={deleteBatch}
        />
      )}
    </div>
  );
}

function TermsView() {
  const [batchId, setBatchId] = useState("");
  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "terms-filter", "unlimited"],
    queryFn: () => listBatches({ page: 1, limit: 999 }),
  });
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_LIST, batchId],
    queryFn: () => listTerms({ page: 1, limit: 999, ...(batchId ? { batchId } : {}) }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const termRows = query.data?.data?.data ?? [];
  const termTotal = query.data?.data?.pagination?.total ?? 0;
  const batches: T_BATCH[] = batchesQuery.data?.data?.data ?? [];

  const head: T_TableHead<T_TERM>[] = [
    { key: "termNumber", headName: "#", minWidth: 60 },
    { key: "name", headName: "Name", minWidth: 200 },
    { key: "startDateBs", headName: "Start Date", minWidth: 180 },
    { key: "endDateBs", headName: "End Date", minWidth: 180 },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[280px] max-w-sm flex-1">
          <SelectCommand
            value={batchId}
            onChange={(v) => setBatchId(v ?? "")}
            options={batches.map((b) => ({
              label: b.course ? `${b.course.code} - ${b.name}` : b.name,
              value: b.id,
              searchValues: `${b.name} ${b.course?.code ?? ""} ${b.course?.name ?? ""}`,
            }))}
            placeholder={batchesQuery.isLoading ? "Loading batches..." : "Filter by batch (all)"}
            searchPlaceholder="Search batches..."
            loading={batchesQuery.isLoading}
            isClearable
          />
        </div>
        <PageHeader
          title=""
          breadCrumbItems={[]}
          createPage="/admin/terms/create"
          createPageTitle="New Term"
        />
      </div>
      <GenericTable
        tableHeads={head}
        data={termRows}
        onEdit={(t) => `/admin/terms/edit/${t.id}`}
        emptyTitle="No terms for this batch."
        pagination={{ page: 1, limit: 999, total: termTotal, onPageChange: () => {} }}
      />
    </div>
  );
}

function SubjectsView() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SUBJECT_LIST, "batches-view", "unlimited"],
    queryFn: () => listSubjects({ page: 1, limit: 999 }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const subjectRows = query.data?.data?.data ?? [];
  const subjectTotal = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_SUBJECT>[] = [
    { key: "code", headName: "Code" },
    { key: "name", headName: "Name" },
    { key: "description", headName: "Description" },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-base font-semibold">Subjects</h3>
        <PageHeader
          title=""
          breadCrumbItems={[]}
          createPage="/admin/subjects/create"
          createPageTitle="New Subject"
        />
      </div>
      <GenericTable
        tableHeads={head}
        data={subjectRows}
        onEdit={(s) => `/admin/subjects/edit/${s.id}`}
        emptyTitle="No subjects."
        pagination={{ page: 1, limit: 999, total: subjectTotal, onPageChange: () => {} }}
      />
    </div>
  );
}
