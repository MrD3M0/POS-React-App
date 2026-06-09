// components/category/create-category.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
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
import {
  CategorySchema,
  CategorySchemaDefaultValues,
  type T_CategorySchema,
} from "./schema/schema";
import { createCategory } from "./service/service";
import type { T_UseQueryError } from "@/types/common";

const CreateCategory = () => {
  const navigate = useNavigate();
  const form = useForm<T_CategorySchema>({
    resolver: zodResolver(CategorySchema),
    defaultValues: { ...CategorySchemaDefaultValues },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created successfully.");
      return navigate("/category");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  return (
    <div className="p-5">
      <title>Create Category | Billing System</title>
      <PageHeader
        title="Create Category"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Categories", link: "/category" },
          { title: "Create", link: "/category/create" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            createCategoryMutation.mutate(data);
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
                    <Input placeholder="Eg: ELC, GRO" {...field} />
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
                disabled={createCategoryMutation.isPending}
                variant={"secondary"}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={createCategoryMutation.isPending}
              disabled={createCategoryMutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateCategory;
