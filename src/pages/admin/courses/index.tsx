import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listCourses, deleteCourse, type T_COURSE } from "./service/service";

const LIMIT = 10;

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_COURSE_LIST, search, page],
    queryFn: () => listCourses({ page, limit: LIMIT, search }),
  });

  const rows: T_COURSE[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_COURSE>[] = [
    { key: "code", headName: "Code" },
    { key: "name", headName: "Name" },
    { key: "system", headName: "System", render: (c) => <Badge variant="outline">{c.system}</Badge> },
    { key: "totalTerms", headName: "Total Terms" },
    { key: "description", headName: "Description" },
    {
      key: "isActive",
      headName: "Status",
      render: (c) => (
        <Badge variant={c.isActive === false ? "destructive" : "default"}>
          {c.isActive === false ? "Inactive" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Courses"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Courses", link: "/admin/courses" }]}
        createPage="/admin/courses/create"
        createPageTitle="New Course"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(item) => `/admin/courses/edit/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No courses found."
        renderRow={(c) => ({ description: c.description ?? "—" })}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search courses..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Course"
          onDelete={deleteCourse}
        />
      )}
    </div>
  );
}
