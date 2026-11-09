import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getExamById, updateExam, type T_EXAM } from "../service/service";
import EditExamForm from "../components/edit-exam-form";

function toExam(raw: unknown): T_EXAM | null {
  const r = raw as { data?: T_EXAM | { data?: T_EXAM } };
  if (!r?.data) return null;
  const inner = (r.data as { data?: T_EXAM }).data;
  return (inner && typeof inner === "object" && "id" in inner ? inner : (r.data as T_EXAM)) ?? null;
}

export default function EditExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "detail", id],
    queryFn: () => getExamById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: ({ examId, payload }: { examId: string; payload: Record<string, unknown> }) => updateExam(examId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_EXAMS] });
      toast.success("Exam updated");
      navigate("/teacher/exams");
    },
    onError: (error: AxiosError<{ message?: string }>) => toast.error(error.response?.data?.message ?? "Failed to update exam"),
  });

  if (!id) return <AlertHandler variant="error" />;
  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const record = toExam(query.data);
  if (!record) return <AlertHandler variant="error" />;

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Edit Exam"
        backPage="/teacher/exams"
        backPageTitle="Back to Exams"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Exams", link: "/teacher/exams" },
          { title: "Edit" },
        ]}
      />
      <EditExamForm
        record={record}
        isPending={mutation.isPending}
        onCancel={() => navigate("/teacher/exams")}
        onSubmit={(examId, payload) => mutation.mutate({ examId, payload })}
      />
    </div>
  );
}
