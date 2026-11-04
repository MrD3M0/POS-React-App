import { useState } from "react";
import { useAuth } from "@/auth/context/auth-context";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Role } from "@/pages/auth/shared/role-login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleLoginSchema } from "@/pages/auth/shared/role-login-schema";
import { useForm } from "react-hook-form";

type TRoleLoginFormValues = z.infer<typeof roleLoginSchema>;

const ROLE_TITLE: Record<Role, string> = {
  ADMIN: "Admin",
  PRINCIPAL: "Principal",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  STAFF: "Staff",
};

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
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        {ROLE_TITLE[role]} Login
      </h1>
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
                    <Input
                      placeholder="admin@example.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
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
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-primary text-white hover:bg-secondary border-2 border-transparent"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          No account?{" "}
          <Link
            to="/register"
            className="text-primary underline cursor-pointer"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LogIn() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-10 left-10 text-4xl font-bold text-gray-700 mb-4 hidden md:block">
        Collify Management System
      </div>
      <Link to="/register">
        <div className="absolute top-5 left-5 text-3xl font-bold text-gray-800 mb-1 hidden lg:block">
          Collify
        </div>
      </Link>
      <div className="relative z-10 w-full max-w-md">
        <LoginForm role="ADMIN" />
        <Tabs defaultValue="ADMIN" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ADMIN">Admin</TabsTrigger>
            <TabsTrigger value="PRINCIPAL">Principal</TabsTrigger>
            <TabsTrigger value="ACCOUNTANT">Accountant</TabsTrigger>
            <TabsTrigger value="TEACHER">Teacher</TabsTrigger>
            <TabsTrigger value="STAFF">Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="ADMIN">
            <LoginForm role="ADMIN" />
          </TabsContent>
          <TabsContent value="PRINCIPAL">
            <LoginForm role="PRINCIPAL" />
          </TabsContent>
          <TabsContent value="ACCOUNTANT">
            <LoginForm role="ACCOUNTANT" />
          </TabsContent>
          <TabsContent value="TEACHER">
            <LoginForm role="TEACHER" />
          </TabsContent>
          <TabsContent value="STAFF">
            <LoginForm role="STAFF" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
