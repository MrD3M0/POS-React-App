import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listExams, type T_EXAM } from "../../exams/service/service";
import {
  listBatchTermSubjects,
  createExamSubject,
  type T_BATCH_TERM_SUBJECT,
} from "../service/service";
import CreateExamSubjectForm from "../components/create-exam-subject-form";

function toRows<T>(raw: unknown): T[] {
  const r = raw as { data?: T[] | { data?: T[] } };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}

export default function CreateExamSubjectPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const examsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "picker", "unlimited"],
    queryFn: () => listExams({ page: 1, limit: -1 }),
  });
  const btsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS, "bts-picker", "unlimited"],
    queryFn: () => listBatchTermSubjects({ page: 1, limit: -1 }),
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createExamSubject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS] });
      toast.success("Exam subject created");
      navigate("/teacher/exam-subjects");
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      toast.error(error.response?.data?.message ?? "Failed to create exam subject"),
  });

  if (examsQuery.isLoading || btsQuery.isLoading) return <ScreenLoader />;
  if (examsQuery.isError || btsQuery.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Create Exam Subject"
        backPage="/teacher/exam-subjects"
        backPageTitle="Back to Exam Subjects"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Exam Subjects", link: "/teacher/exam-subjects" },
          { title: "Create" },
        ]}
      />
      <CreateExamSubjectForm
        exams={toRows<T_EXAM>(examsQuery.data)}
        btsList={toRows<T_BATCH_TERM_SUBJECT>(btsQuery.data)}
        examsLoading={examsQuery.isLoading}
        btsLoading={btsQuery.isLoading}
        isPending={mutation.isPending}
        onCancel={() => navigate("/teacher/exam-subjects")}
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </div>
  );
}
