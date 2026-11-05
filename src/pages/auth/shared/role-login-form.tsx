import { useState } from "react";
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/form";
import { Input } from "@/components/ui/input";
import Button  from "@/components/ui/button";
import ScreenLoader from "@/components/ui/screen-loader";
import { useAuth } from "@/auth/context/auth-context";
import { useNavigate, Link } from "react-router-dom";
import type { Role } from "./role-login-schema";
import type { TRoleLoginSchema } from "./role-login-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleLoginSchema } from "./role-login-schema";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

interface RoleLoginFormProps {
  role: Role;
  nextPath?: string;
}

// Single reusable card driven by the shared backend login endpoint, used by all five per-role pages.
// Each page passes in its title text (the backend already routes by role, so this is just presentation).
export function RoleLoginForm({ role, nextPath = "/dashboard" }: RoleLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<TRoleLoginSchema>({
    resolver: zodResolver(roleLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: TRoleLoginSchema) {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      navigate(nextPath);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <ScreenLoader />
      <Card className="h-auto p-8 w-full" style={{ marginTop: 16 }}>
        <CardHeader>
          <CardTitle>{ROLE_TITLE[role]} Login</CardTitle>
          <CardDescription>
            Enter your <strong>{ROLE_TITLE[role]} </strong>email below to login
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" type="email" autoComplete="email" {...field} />
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
                      <Input placeholder="*******" type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <div className="grid grid-cols-1 place-items-center gap-2 mt-3">
              <Button type="submit" className="w-9/10" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <Button type="button" variant="outline" className="w-9/10">
                <Link to={role === "ADMIN" ? "/auth/admin/register" : "/register"}>
                  {role === "ADMIN" ? "Register" : "Other"}
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

const ROLE_TITLE: Record<Role, string> = {
  ADMIN: "Admin",
  PRINCIPAL: "Principal",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  STAFF: "Staff",
};
