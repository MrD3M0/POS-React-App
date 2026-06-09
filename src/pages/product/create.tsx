// components/product/create-product.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { type T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";

import { createProduct } from "./service/service";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { getAllCategories } from "../categories/service/service";
import {
  ProductSchema,
  ProductSchemaDefaultValues,
  type T_ProductSchema,
} from "./schema/schema";

const CreateProduct = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<T_ProductSchema>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { ...ProductSchemaDefaultValues },
  });

  const categoriesQuery = useQuery({
    queryKey: [QUERY_KEYS.CATEGORY_LIST],
    queryFn: () => getAllCategories({ limit: 100 }),
  });

  const categories = categoriesQuery.data?.data?.data ?? [];

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_LIST] });
      return navigate("/products");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  return (
    <div className="p-5">
      <title>Create Product | Billing System</title>
      <PageHeader
        title="Create Product"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Products", link: "/product" },
          { title: "Create", link: "/product/create" },
        ]}
      />

      <div className="px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              createProductMutation.mutate(data);
            })}
          >
            <div className="grid sm:grid-cols-2 grid-rows-1 sm:gap-x-3 gap-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Eg: Current Noodles" {...field} />
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
                      <Input placeholder="Eg: CRN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Eg: 35" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Eg: 150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={categoriesQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end items-center space-x-3 mb-5 mt-5">
              <Link to="/products">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={createProductMutation.isPending}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                loading={createProductMutation.isPending}
                disabled={
                  createProductMutation.isPending || categoriesQuery.isLoading
                }
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateProduct;
