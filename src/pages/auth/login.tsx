import { Link } from "react-router-dom";

import BrandedLayout from "@/pages/auth/branded-layout";
import { LoginForm } from "@/pages/auth/shared/login-form";

export function LogIn() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <BrandedLayout className="hidden lg:block" />

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="mb-6 text-xl font-semibold tracking-tight lg:hidden">
              Collify
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Welcome back
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Sign in to Collify
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              One account for every role — admin, principal, accountant, teacher
              and staff.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
