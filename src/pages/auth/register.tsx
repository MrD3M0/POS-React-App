import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BrandedLayout from "./branded-layout";
import ScreenLoader from "@/components/ui/screen-loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/context/auth-context";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type T_RegisterSchema,
} from "./schema/resgister-schema";
import { Link, Navigate } from "react-router-dom";

const Register = () => {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: T_RegisterSchema) => {
    // Destructuring drops 'Confirmpassword', keeping only the rest
    const { username, email, password } = values;

    try {
      setIsLoading(true);
      await registerUser(username, email, password);
      Navigate({ to: "/login" });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center gap-16">
      <BrandedLayout />
      <Card className="w-full max-w-md h-120">
        {isLoading && <ScreenLoader />}
        <CardHeader>
          <CardTitle>Register your account</CardTitle>
          <CardDescription>
            Enter your details below to register to your account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" type="string" {...field} />
                    </FormControl>
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
                      <Input
                        placeholder="johndoe@email.com"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
                Register
              </Button>
              <Button type="button" variant="outline" className="w-9/10">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
