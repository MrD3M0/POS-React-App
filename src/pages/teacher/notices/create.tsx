import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import PageHeader from "@/components/common/page-header";
import NoticeForm from "@/components/common/notice-form";
import { createNotice, type T_NOTICE_INPUT } from "@/pages/notices/service/service";

/**
 * A teacher creates a notice for the students of the classes they teach. The
 * audience is limited to those classes (enforced by the backend as well).
 */
export default function CreateTeacherNoticePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: T_NOTICE_INPUT) => createNotice(input),
    onSuccess: () => {
      toast.success("Notice sent to your class.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_NOTICES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION] });
      navigate("/teacher/notices");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create notice.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="New Notice"
        description="Send a notice to the students of one of your classes."
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Notices", link: "/teacher/notices" },
          { title: "Create", link: "/teacher/notices/create" },
        ]}
        backPage="/teacher/notices"
      />

      <div className="mt-4 w-full max-w-3xl">
        <NoticeForm
          backPage="/teacher/notices"
          submitLabel="Send Notice"
          isPending={mutation.isPending}
          onSubmit={(input) => mutation.mutate(input)}
        />
      </div>
    </div>
  );
}
