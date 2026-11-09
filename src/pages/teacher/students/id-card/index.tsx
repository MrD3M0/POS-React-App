import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getStudent } from "../service/service";
import StudentIdCard from "@/pages/students/id-card/StudentIdCard";

export default function TeacherStudentIdCardPage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_STUDENTS, "id-card", id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  const student = query.data?.data;
  if (!student) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Student ID Card"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Students", link: "/teacher/students" },
          { title: "ID Card", link: `/teacher/students/${id}/id-card` },
        ]}
        backPage="/teacher/students"
        actions={
          <div className="no-print flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              Print ID Card
            </Button>
          </div>
        }
      />
      <div className="mt-2">
        <StudentIdCard student={student} />
      </div>
      <div className="no-print mt-4 flex justify-center">
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          Print ID Card
        </Button>
      </div>
    </div>
  );
}
