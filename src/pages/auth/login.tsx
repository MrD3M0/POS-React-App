import { useAuth } from "@/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema } from "./schema/login-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ScreenLoader from "@/components/ui/screen-loader";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import type { z } from "zod";

type T_LoginSchema = z.infer<typeof loginSchema>;

export function LogIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const form = useForm<T_LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: T_LoginSchema) {
    try {
      setIsLoading(true);
      await login(values.email, values.password);

      const raw = searchParams.get("next") || "/dashboard";
      const nextPath =
        raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
      navigate(nextPath);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  } // ← properly closed

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card className="w-full max-w-md h-90">
        {isLoading && <ScreenLoader />}
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                      <Input
                        placeholder="you@email.com"
                        type="email"
                        autoComplete="email"
                        autoFocus
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
                        placeholder="*******"
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <div className="grid grid-cols-1 place-items-center gap-2 mt-3">
              <Button type="submit" className="w-9/10">
                Login
              </Button>
              <Button type="button" variant="outline" className="w-9/10">
                Register
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
