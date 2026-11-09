import { useState } from "react";
import { useAuth } from "@/auth/context/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import Button from "@/components/ui/button";
import { REGISTER_SCHEMA } from "./schema/register-schema";
import type { T_RegisterFormValues } from "./schema/register-schema";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(REGISTER_SCHEMA),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: T_RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(values.username, values.email, values.password);
      toast.success("Account created. Please login.");
      navigate("/login");
    } catch (error) {
      toast.error((error as Error).message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormDescription>Choose a unique username for sign-in.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" type="email" {...field} />
                  </FormControl>
                  <FormDescription>We’ll use this for account communication.</FormDescription>
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
                    <PasswordInput placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormDescription>Use a strong password (minimum as required by policy).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Confirm password" {...field} />
                  </FormControl>
                  <FormDescription>Must match the password above.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4 w-full bg-primary text-white hover:bg-secondary border-2 border-transparent" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account? <Link to="/login" className="text-primary underline cursor-pointer">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
