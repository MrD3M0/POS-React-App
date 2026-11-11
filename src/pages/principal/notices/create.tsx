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
 * A principal may address everybody or pick the roles/classes that should
 * receive the notice.
 */
export default function CreatePrincipalNoticePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: T_NOTICE_INPUT) => createNotice(input),
    onSuccess: () => {
      toast.success("Notice created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "notices"] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION] });
      navigate("/principal/notices");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create notice.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="New Notice"
        description="Send a notice to everybody or to selected roles and classes."
        breadCrumbItems={[
          { title: "Principal", link: "/principal/notices" },
          { title: "Notices", link: "/principal/notices" },
          { title: "Create", link: "/principal/notices/create" },
        ]}
        backPage="/principal/notices"
      />

      <div className="mt-4 w-full max-w-3xl">
        <NoticeForm
          backPage="/principal/notices"
          submitLabel="Create Notice"
          isPending={mutation.isPending}
          onSubmit={(input) => mutation.mutate(input)}
        />
      </div>
    </div>
  );
}
