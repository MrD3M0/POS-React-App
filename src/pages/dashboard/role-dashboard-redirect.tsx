import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/context/auth-context";
import PageHeader from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { T_Role } from "@/lib/models";

/** Render a role area only for the listed roles; everyone else is redirected. */
export function RoleOnly({
  roles,
  children,
}: {
  roles: T_Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user?.role) return null;
  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

/** Students do not have a login/portal yet — keep a safe, helpful landing page. */
export function StudentFallbackPage() {
  return (
    <div className="p-5">
      <PageHeader
        title="Student portal"
        description="Student self-service is not enabled yet."
        breadCrumbItems={[{ title: "Home", link: "/dashboard" }]}
      />
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <GraduationCap className="size-8 text-primary" />
          <div>
            <p className="font-semibold">Ask the college office for your details</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Students do not have a login in this release. Attendance, marks, results
              and fee receipts are managed by teachers and the accountant. If you need a
              copy, contact the admin office.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** `/dashboard` sends every role to its dedicated dashboard. */
export default function RoleDashboardRedirect() {
  const { user } = useAuth();
  switch (user?.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "PRINCIPAL":
      return <Navigate to="/principal" replace />;
    case "ACCOUNTANT":
      return <Navigate to="/accountant" replace />;
    case "TEACHER":
      return <Navigate to="/teacher/dashboard" replace />;
    case "STAFF":
      return <Navigate to="/staff" replace />;
    default:
      return <StudentFallbackPage />;
  }
}
