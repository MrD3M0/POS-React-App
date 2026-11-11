import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import NoticeForm from "@/components/common/notice-form";
import {
  getNoticeById,
  updateNotice,
  type T_NOTICE,
  type T_NOTICE_INPUT,
} from "@/pages/notices/service/service";

function unwrapNotice(data: unknown): T_NOTICE | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as { data?: T_NOTICE } & T_NOTICE;
  return (d.data && typeof d.data === "object" ? d.data : d) as T_NOTICE;
}

export default function EditNoticePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_NOTICE_GET, id],
    queryFn: () => getNoticeById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (input: T_NOTICE_INPUT) => updateNotice(id!, input),
    onSuccess: () => {
      toast.success("Notice updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_NOTICE_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_NOTICE_GET, id] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION] });
      navigate("/admin/notices");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update notice.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  const notice = unwrapNotice(query.data);

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Notice"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Notices", link: "/admin/notices" },
          { title: "Edit", link: `/admin/notices/edit/${id}` },
        ]}
        backPage="/admin/notices"
      />

      <div className="mt-4 w-full max-w-3xl">
        <NoticeForm
          notice={notice}
          backPage="/admin/notices"
          submitLabel="Save Changes"
          isPending={mutation.isPending}
          onSubmit={(input) => mutation.mutate(input)}
        />
      </div>
    </div>
  );
}
