// components/category/update-category.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { mapFieldsOnError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/page-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { CategorySchema, type T_CategorySchema } from "./schema/schema";
import { getCategoryById, updateCategory } from "./service/service";
import type { T_UseQueryError } from "@/types/common";

const UpdateCategory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const form = useForm<T_CategorySchema>({
    resolver: zodResolver(CategorySchema),
    defaultValues: { name: "", shortName: "" },
  });

  const query = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data?.data) {
      form.reset({
        name: query.data.data.name,
        shortName: query.data.data.shortName,
      });
    }
  }, [query.data, query.isSuccess, form]);

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("Category updated successfully.");
      return navigate("/category");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  return (
    <div className="p-5">
      <title>Update Category | Billing System</title>
      <PageHeader
        title="Update Category"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Categories", link: "/category" },
          { title: "Update", link: `/category/${id}` },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            updateCategoryMutation.mutate({ data, id: id! });
          })}
        >
          <div className="grid sm:grid-cols-2 grid-rows-2 sm:gap-x-3 gap-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Eg: Electronics, Groceries"
                      disabled={query.isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Eg: ELC, GRO"
                      disabled={query.isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end items-center space-x-3 mb-5 mt-5">
            <Link to={"/categories"}>
              <Button
                type="button"
                disabled={updateCategoryMutation.isPending}
                variant={"secondary"}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={updateCategoryMutation.isPending}
              disabled={updateCategoryMutation.isPending || query.isLoading}
            >
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateCategory;
