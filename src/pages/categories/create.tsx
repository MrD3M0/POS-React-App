import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Form, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { mapFieldsOnError } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import ActiveStatusField from "@/components/common/active-status-field";
import PageHeader from "@/components/common/page-header";
import {
  MealTypeSchema,
  MealTypeSchemaDefaultValues,
  MealTypeSchemaType,
} from "./schema/meal-schema";
import { createMeal } from "./services/services";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";

const CreateMeal = () => {
  const navigate = useNavigate();
  const form = useForm<MealTypeSchemaType>({
    resolver: zodResolver(MealTypeSchema),
    defaultValues: { ...MealTypeSchemaDefaultValues },
  });

  const createMealMutation = useMutation({
    mutationFn: createMeal,
    onSuccess: () => {
      toast.success("Meal created successfully.");
      return navigate("/meals");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  return (
    <div>
      <title>Create Meal | Sajilo HMS</title>
      <PageHeader
        title="Create Meal"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Meals", link: "/meals" },
          { title: "Create", link: "/meals/create" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            createMealMutation.mutate(data);
          })}
        >
          <div className="grid sm:grid-cols-2 grid-rows-2 sm:gap-x-3 gap-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Eg: Breakfast, Lunch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="shortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Eg: br1, lu1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Eg: 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <ActiveStatusField
              control={form.control}
              name="status"
              className="sm:col-span-2 w-full"
            />
          </div>

          <div className="flex justify-end items-center space-x-3 mb-5 mt-5">
            <Link to={"/meals"}>
              <Button
                type="button"
                disabled={createMealMutation.isPending}
                variant={"secondary"}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={createMealMutation.isPending}
              disabled={createMealMutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateMeal;
