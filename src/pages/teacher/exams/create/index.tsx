import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import PageHeader from "@/components/common/page-header";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createExam } from "../service/service";
import CreateExamForm from "../components/create-exam-form";

export default function CreateExamPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createExam(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_EXAMS] });
      toast.success("Exam created");
      navigate("/teacher/exams");
    },
    onError: (error: AxiosError<{ message?: string }>) => toast.error(error.response?.data?.message ?? "Failed to create exam"),
  });

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Create Exam"
        backPage="/teacher/exams"
        backPageTitle="Back to Exams"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Exams", link: "/teacher/exams" },
          { title: "Create" },
        ]}
      />
      <CreateExamForm
        isPending={mutation.isPending}
        onCancel={() => navigate("/teacher/exams")}
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </div>
  );
}
