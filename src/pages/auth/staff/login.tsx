import { useState } from "react";
import { useAuth } from "@/auth/context/auth-context";
import { Link } from "react-router-dom";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import type { Role } from "../shared/role-login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleLoginSchema } from "../shared/role-login-schema";

const ROLE_TITLE: Record<Role, string> = {
  ADMIN: "Admin",
  PRINCIPAL: "Principal",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  STAFF: "Staff",
};

type TRoleLoginFormValues = z.infer<typeof roleLoginSchema>;

function LoginForm({ role }: { role: Role }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TRoleLoginFormValues>({
    resolver: zodResolver(roleLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = async (values: TRoleLoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      window.location.href = "/dashboard";
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold mb-6 text-center">{ROLE_TITLE[role]} Login</h1>
      <div className="card-shadow card p-6 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="staff@example.com" type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full mt-2 bg-primary text-white hover:bg-secondary border-2 border-transparent">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default LoginForm;
