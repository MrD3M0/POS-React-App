// components/product/edit-product.tsx
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { getAllCategories } from "../categories/service/service";
import { getProductById, updateProduct } from "./service/service";
import {
  ProductSchema,
  ProductSchemaDefaultValues,
  type T_ProductSchema,
} from "./schema/schema";
import ScreenLoader from "@/components/ui/screen-loader";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<T_ProductSchema>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { ...ProductSchemaDefaultValues },
  });

  const productQuery = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, id],
    queryFn: () => getProductById(id ?? ""),
    enabled: !!id,
  });

  const categoriesQuery = useQuery({
    queryKey: [QUERY_KEYS.CATEGORY_LIST],
    queryFn: () => getAllCategories({ limit: 100 }),
  });

  const categories = categoriesQuery.data?.data?.data ?? [];

  useEffect(() => {
    if (productQuery.isSuccess && productQuery.data) {
      const p = productQuery.data.data;
      form.reset({
        name: p.name,
        shortName: p.shortName,
        price: p.price,
        quantity: p.quantity,
        categoryId: p.categoryId,
      });
    }
  }, [productQuery.data, productQuery.isSuccess, form]);

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success("Product updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_LIST] });
      return navigate("/products");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  if (productQuery.isLoading) return <ScreenLoader />;

  return (
    <div className="p-5">
      <title>Edit Product | Billing System</title>
      <PageHeader
        title="Edit Product"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Products", link: "/product" },
          { title: "Edit", link: `/product/${id}` },
        ]}
      />

      <div className="px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              updateProductMutation.mutate({ id: id ?? "", data });
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
                      <Input
                        type="number"
                        placeholder="Eg: 35"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
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
                      <Input
                        type="number"
                        placeholder="Eg: 150"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
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
                      value={field.value}
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
                  disabled={updateProductMutation.isPending}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                loading={updateProductMutation.isPending}
                disabled={
                  updateProductMutation.isPending || categoriesQuery.isLoading
                }
              >
                Update
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditProduct;
