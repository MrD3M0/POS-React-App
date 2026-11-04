import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 50;

export default function TeacherMyClassesPage() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES],
    queryFn: () => ({ teacherUrl: "/teacher/my-classes" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_CLASS[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader title="My Classes" breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "My Classes", link: "/teacher/my-classes" }]} />
      <div className="flex justify-end mb-4">
        <Button>Mark all present</Button>
      </div>
      <GenericTable
        tableHeads={[
          { key: "batchName", headName: "Batch", minWidth: 220 },
          { key: "subjectCode", headName: "Subject Code", minWidth: 180 },
          { key: "className", headName: "Class Name", minWidth: 240 },
          { key: "studentCount", headName: "Students", minWidth: 120 },
        ]}
        data={rows}
        emptyTitle="No classes assigned to you."
        pagination={{ page: 1, limit: LIMIT, total: rows.length, onPageChange: () => {} }}
        renderRow={(c) => ({ batchName: c.batchName, subjectCode: c.subjectCode, className: c.className, studentCount: c.studentCount } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}

type T_CLASS = {
  id: string;
  batchName: string;
  subjectCode: string;
  className: string;
  studentCount: number;
};
