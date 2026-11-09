import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { InputWithSwitch } from "@/components/input-with-switch";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import PageHeader from "@/components/common/page-header";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { getFiscalYearById, updateFiscalYear, type T_FY } from "./service/service";
import {
  fiscalYearCreateDefaultValues,
  fiscalYearCreateSchema,
  type FiscalYearCreateFormValues,
} from "./schema/schema";

function unwrapFy(data: unknown): T_FY | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as { data?: T_FY } & T_FY;
  return (d.data && typeof d.data === "object" ? d.data : d) as T_FY;
}

export default function EditFiscalYearPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FISCALYEAR_GET, id],
    queryFn: () => getFiscalYearById(id!),
    enabled: !!id,
  });

  const form = useForm<FiscalYearCreateFormValues>({
    resolver: zodResolver(fiscalYearCreateSchema),
    defaultValues: fiscalYearCreateDefaultValues,
  });

  useEffect(() => {
    const fy = unwrapFy(query.data);
    if (fy) {
      form.reset({
        name: fy.name ?? "",
        startDateBs: fy.startDateBs ?? "",
        endDateBs: fy.endDateBs ?? "",
        isCurrent: fy.isCurrent ?? false,
        isClosed: fy.isClosed ?? false,
      });
    }
  }, [query.data, form]);

  const mutation = useMutation({
    mutationFn: (data: FiscalYearCreateFormValues) =>
      updateFiscalYear(id!, {
        name: data.name.trim(),
        startDateBs: data.startDateBs,
        endDateBs: data.endDateBs,
        isCurrent: data.isCurrent,
        isClosed: data.isClosed,
      }),
    onSuccess: () => {
      toast.success("Fiscal year updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FISCALYEAR_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FISCALYEAR_GET, id] });
      navigate("/admin/fiscal-years");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update fiscal year.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Fiscal Year"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Fiscal Years", link: "/admin/fiscal-years" },
          { title: "Edit", link: `/admin/fiscal-years/edit/${id}` },
        ]}
        backPage="/admin/fiscal-years"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal Year Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2081/82" {...field} />
                  </FormControl>
                  <FormDescription>Display label for the fiscal year.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="e.g. 2081-04-01"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Fiscal year start date in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="e.g. 2082-03-31"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Fiscal year end date in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Fiscal Year</FormLabel>
                    <FormControl>
                      <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Yes (Active)", off: "No" }} />
                    </FormControl>
                    <FormDescription>Mark as the active running fiscal year when applicable.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isClosed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closed</FormLabel>
                    <FormControl>
                      <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Closed", off: "Open" }} />
                    </FormControl>
                    <FormDescription>Closed fiscal years should not accept normal accounting changes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/fiscal-years">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
