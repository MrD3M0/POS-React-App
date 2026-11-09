import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listSubjects, deleteSubject, type T_SUBJECT } from "./service/service";

const LIMIT = 10;

export default function AdminSubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SUBJECT_LIST, search, page],
    queryFn: () => listSubjects({ page, limit: LIMIT, search }),
  });

  const rows: T_SUBJECT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_SUBJECT>[] = [
    { key: "code", headName: "Code" },
    { key: "name", headName: "Name" },
    { key: "description", headName: "Description" },
    {
      key: "isActive",
      headName: "Status",
      render: (item) => (
        <Badge variant={item.isActive === false ? "destructive" : "default"}>
          {item.isActive === false ? "Inactive" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Subjects"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Subjects", link: "/admin/subjects" }]}
        createPage="/admin/subjects/create"
        createPageTitle="New Subject"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(item) => `/admin/subjects/edit/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        emptyTitle="No subjects found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search subjects..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Subject"
          onDelete={deleteSubject}
        />
      )}
    </div>
  );
}
