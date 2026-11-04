import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "@/providers/auth-provider";
import { RequireAuth } from "@/providers/require-auth";
import { RequireGuest } from "@/providers/require-guest";
import SidebarLayout from "@/providers/sidebar-layout";
import { Can } from "@/auth/permissions";

import LogIn from "@/pages/auth/login";
import Register from "@/pages/auth/register";

import RoleAdminLogin from "@/pages/auth/admin/login";
import RolePrincipalLogin from "@/pages/auth/principal/login";
import RoleTeacherLogin from "@/pages/auth/teacher/login";
import RoleAccountantLogin from "@/pages/auth/accountant/login";
import RoleStaffLogin from "@/pages/auth/staff/login";

import DashboardPage from "@/pages/dashboard/dashboard-page";
import ForbiddenPage from "@/pages/errors/403";

// --- Admin module pages ---
import AdminUsersPage from "@/pages/admin/users/index";
import AdminEmployeesPage from "@/pages/admin/employees/index";
import AdminStudentsPage from "@/pages/admin/students/index";
import AcademicStructurePage from "@/pages/admin/batches/index";
import AdminTermsPage from "@/pages/admin/terms/index";
import AdminSubjectsPage from "@/pages/admin/subjects/index";
import AdminTeachingAssignmentsPage from "@/pages/admin/teaching-assignments/index";
import AdminLookupsPage from "@/pages/admin/lookups/index";
import AdminNoticesPage from "@/pages/admin/notices/index";
import AdminSettingsPage from "@/pages/admin/settings/index";
import AdminFiscalYearsPage from "@/pages/admin/fiscal-years/index";
import AdminAuditPage from "@/pages/admin/audit/index";

// --- Principal pages ---
import PrincipalAttendancePage from "@/pages/principal/attendance/index";
import PendingResultsPage from "@/pages/principal/results/pending/index";
import PendingPayrollPage from "@/pages/principal/payroll/pending/index";
import PrincipalReportsPage from "@/pages/principal/reports/index";

// --- Accountant pages ---
import AccountantFeeStructuresPage from "@/pages/accountant/fee-structures/index";
import AccountantPaymentsPage from "@/pages/accountant/payments/index";
import AccountantReceiptsPage from "@/pages/accountant/receipts/index";
import AccountantJournalPage from "@/pages/accountant/journal/index";
import AccountantLedgersPage from "@/pages/accountant/ledgers/index";
import AccountantPayrollWizardPage from "@/pages/accountant/payroll/wizard/index";
import AccountantPayslipsPage from "@/pages/accountant/payslips/index";
import AccountantAttendancePage from "@/pages/accountant/attendance/index";
import BillingPage from "@/pages/billing/billing";

// --- Teacher pages ---
import TeacherMyClassesPage from "@/pages/teacher/my-classes/index";
import TeacherTakeAttendancePage from "@/pages/teacher/take-attendance/index";
import TeacherExamsPage from "@/pages/teacher/exams/index";
import TeacherMarksEntryPage from "@/pages/teacher/marks/index";
import TeacherResultsPage from "@/pages/teacher/results/index";
import TeacherStudentsPage from "@/pages/teacher/students/index";
import AddStudentPage from "@/pages/teacher/students/add/index";

// --- Staff pages ---
import StaffProfilePage from "@/pages/staff/profile/index";
import StaffPayslipsPage from "@/pages/staff/payslips/index";
import StaffAttendancePage from "@/pages/staff/attendance/index";

const router = createBrowserRouter([
  // Public / Guest Only Routes
  {
    element: <RequireGuest />,
    children: [
      { path: "/login", element: <LogIn /> },
      { path: "/register", element: <Register /> },
      // Per-role login surfaces (guest-accessible). Each validates role implicitly via
      // the shared login endpoint returning the user's real role; this page does not
      // change on submit, so a principal can log in as teacher by navigating /auth/teacher.
      { path: "/auth/admin", element: <RoleAdminLogin /> },
      { path: "/auth/principal", element: <RolePrincipalLogin /> },
      { path: "/auth/teacher", element: <RoleTeacherLogin /> },
      { path: "/auth/accountant", element: <RoleAccountantLogin /> },
      { path: "/auth/staff", element: <RoleStaffLogin /> },
    ],
  },

  // Protected App Routes wrapped in Sidebar Layout
  {
    element: <RequireAuth />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/notices", element: <Can permission="system:notices:read"><DashboardPage /></Can> },
          // --- Admin modules ---
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/employees", element: <AdminEmployeesPage /> },
          { path: "/admin/students", element: <AdminStudentsPage /> },
          { path: "/admin/batches", element: <AcademicStructurePage /> },
          { path: "/admin/terms", element: <AdminTermsPage /> },
          { path: "/admin/subjects", element: <AdminSubjectsPage /> },
          { path: "/admin/teaching-assignments", element: <AdminTeachingAssignmentsPage /> },
          { path: "/admin/lookups", element: <AdminLookupsPage /> },
          { path: "/admin/notices", element: <AdminNoticesPage /> },
          { path: "/admin/settings", element: <AdminSettingsPage /> },
          { path: "/admin/fiscal-years", element: <AdminFiscalYearsPage /> },
          { path: "/admin/audit", element: <AdminAuditPage /> },
          // --- Principal modules ---
          { path: "/principal/attendance", element: <PrincipalAttendancePage /> },
          { path: "/principal/results/pending", element: <PendingResultsPage /> },
          { path: "/principal/payroll/pending", element: <PendingPayrollPage /> },
          { path: "/principal/reports", element: <PrincipalReportsPage /> },
          // --- Accountant modules ---
          { path: "/accountant/fee-structures", element: <AccountantFeeStructuresPage /> },
          { path: "/accountant/payments", element: <AccountantPaymentsPage /> },
          { path: "/accountant/receipts", element: <AccountantReceiptsPage /> },
          { path: "/accountant/journal", element: <AccountantJournalPage /> },
          { path: "/accountant/ledgers", element: <AccountantLedgersPage /> },
          { path: "/accountant/payroll/wizard", element: <AccountantPayrollWizardPage /> },
          { path: "/accountant/payslips", element: <AccountantPayslipsPage /> },
          { path: "/billing", element: <BillingPage /> },
          // --- Teacher modules ---
          { path: "/teacher/my-classes", element: <TeacherMyClassesPage /> },
          { path: "/teacher/take-attendance", element: <TeacherTakeAttendancePage /> },
          { path: "/teacher/exams", element: <TeacherExamsPage /> },
          { path: "/teacher/marks", element: <TeacherMarksEntryPage /> },
          { path: "/teacher/results", element: <TeacherResultsPage /> },
          { path: "/teacher/students", element: <TeacherStudentsPage /> },
          { path: "/teacher/students/add", element: <AddStudentPage /> },
          // --- Staff modules ---
          { path: "/staff/profile", element: <StaffProfilePage /> },
          { path: "/staff/payslips", element: <StaffPayslipsPage /> },
          { path: "/staff/attendance", element: <StaffAttendancePage /> },
          // Fallback for any unregistered path
          { path: "/*", element: <DefaultRedirect /> },
        ],
      },
    ],
  },

  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <ForbiddenPage /> },
]);

function DefaultRedirect() {
  return <Navigate to="/dashboard" replace />;
}

function AppRoutingSetup() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
export default AppRoutingSetup;
