import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { RequireAuth } from "@/providers/require-auth";
import { RequireGuest } from "@/providers/require-guest";
import SidebarLayout from "@/providers/sidebar-layout";
import { Can } from "@/auth/permissions";

import { LogIn } from "@/pages/auth/login";
import Register from "@/pages/auth/register";

import DashboardPage from "@/pages/dashboard/dashboard-page";
import ForbiddenPage from "@/pages/errors/403";

// --- Admin module pages ---
import AdminUsersPage from "@/pages/admin/users/index";
import AdminUserCreatePage from "@/pages/admin/users/create";
import AdminEmployeesPage from "@/pages/admin/employees/index";
import AdminEmployeeCreatePage from "@/pages/admin/employees/create";
import AdminEmployeeEditPage from "@/pages/admin/employees/edit";
import AdminStudentsPage from "@/pages/admin/students/index";
import AdminStudentCreatePage from "@/pages/admin/students/create";
import AdminStudentEditPage from "@/pages/admin/students/edit";
import AdminStudentIdCardPage from "@/pages/admin/students/id-card/index";
import AdminCoursesPage from "@/pages/admin/courses/index";
import AdminCourseCreatePage from "@/pages/admin/courses/create";
import AdminCourseEditPage from "@/pages/admin/courses/edit";
import AcademicStructurePage from "@/pages/admin/batches/index";
import AdminBatchCreatePage from "@/pages/admin/batches/create";
import AdminBatchEditPage from "@/pages/admin/batches/edit";
import AdminTermsPage from "@/pages/admin/terms/index";
import AdminTermCreatePage from "@/pages/admin/terms/create";
import AdminTermEditPage from "@/pages/admin/terms/edit";
import AdminSubjectsPage from "@/pages/admin/subjects/index";
import AdminSubjectCreatePage from "@/pages/admin/subjects/create";
import AdminSubjectEditPage from "@/pages/admin/subjects/edit";
import AdminTeachingAssignmentsPage from "@/pages/admin/teaching-assignments/index";
import AdminTeachingAssignmentCreatePage from "@/pages/admin/teaching-assignments/create";
import AdminLookupsPage from "@/pages/admin/lookups/index";
import AdminLookupCreatePage from "@/pages/admin/lookups/create";
import AdminNoticesPage from "@/pages/admin/notices/index";
import AdminNoticeCreatePage from "@/pages/admin/notices/create";
import AdminNoticeEditPage from "@/pages/admin/notices/edit";
import AdminSettingsPage from "@/pages/admin/settings/index";
import AdminSettingCreatePage from "@/pages/admin/settings/create";
import AdminSettingEditPage from "@/pages/admin/settings/edit";
import AdminFiscalYearsPage from "@/pages/admin/fiscal-years/index";
import AdminFiscalYearCreatePage from "@/pages/admin/fiscal-years/create";
import AdminFiscalYearEditPage from "@/pages/admin/fiscal-years/edit";

// --- Principal pages ---
import PrincipalAttendancePage from "@/pages/principal/attendance/index";
import PendingResultsPage from "@/pages/principal/results/pending/index";
import PublishResultsPage from "@/pages/principal/results/publish/index";
import StudentApprovalPage from "@/pages/principal/students/approval/index";
import PrincipalNoticesPage from "@/pages/principal/notices/index";
import PendingPayrollPage from "@/pages/principal/payroll/pending/index";
import PrincipalReportsPage from "@/pages/principal/reports/index";
import PrincipalAccountantsPage from "@/pages/principal/accountants/index";

// --- Accountant pages ---
import AccountantFeeStructuresPage from "@/pages/accountant/fee-structures/index";
import AccountantPaymentsPage from "@/pages/accountant/payments/index";
import AccountantReceiptsPage from "@/pages/accountant/receipts/index";
import AccountantJournalPage from "@/pages/accountant/journal/index";
import AccountantLedgersPage from "@/pages/accountant/ledgers/index";
import AccountantPayrollWizardPage from "@/pages/accountant/payroll/wizard/index";
import AccountantPayslipsPage from "@/pages/accountant/payslips/index";
import AccountantListPage from "@/pages/accountant/accountants/index";
import AccountantCreatePage from "@/pages/accountant/accountants/create";
import AccountantEditPage from "@/pages/accountant/accountants/edit";
import AccountantAttendancePage from "@/pages/accountant/attendance/index";
import AccountantBillingPage from "@/pages/accountant/billing/index";
import AccountantBillingReceiptPage from "@/pages/accountant/billing/receipt/index";

// --- Teacher pages ---
import TeacherMyClassesPage from "@/pages/teacher/my-classes/index";
import TeacherTakeAttendancePage from "@/pages/teacher/take-attendance/index";
import TeacherExamsPage from "@/pages/teacher/exams/index";
import TeacherExamCreatePage from "@/pages/teacher/exams/create/index";
import TeacherExamEditPage from "@/pages/teacher/exams/edit/index";
import TeacherMarksEntryPage from "@/pages/teacher/marks/index";
import TeacherResultsPage from "@/pages/teacher/results/index";
import TeacherStudentsPage from "@/pages/teacher/students/index";
import TeacherStudentIdCardPage from "@/pages/teacher/students/id-card/index";
import AddTeacherStudentPage from "@/pages/teacher/students/add/index";
import EditTeacherStudentPage from "@/pages/teacher/students/edit/index";
import TeacherExamSubjectsPage from "@/pages/teacher/exam-subjects/index";
import TeacherAttendanceSessionsPage from "@/pages/teacher/attendance-sessions/index";
import TeacherBatchPayPage from "@/pages/teacher/batch-pay/index";
import TeacherResultDetailPage from "@/pages/teacher/results/detail/index";
import TeacherNoticesPage from "@/pages/teacher/notices/index";

// --- Staff pages ---
import StaffProfilePage from "@/pages/staff/profile/index";
import StaffProfileEditPage from "@/pages/staff/profile/edit/index";
import StaffPayslipsPage from "@/pages/staff/payslips/index";
import StaffPayslipDetailPage from "@/pages/staff/payslips/detail/index";
import StaffAttendancePage from "@/pages/staff/attendance/index";
import StaffLeavePage from "@/pages/staff/leave/index";
import StaffNoticesPage from "@/pages/staff/notices/index";

const router = createBrowserRouter([
  // Public / Guest Only Routes
  {
    element: <RequireGuest />,
    children: [
      { path: "/login", element: <LogIn /> },
      { path: "/register", element: <Register /> },
      // Legacy per-role login links all resolve to the single login page.
      { path: "/auth/*", element: <Navigate to="/login" replace /> },
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
          { path: "/admin/users/create", element: <AdminUserCreatePage /> },

          { path: "/admin/employees", element: <AdminEmployeesPage /> },
          { path: "/admin/employees/create", element: <AdminEmployeeCreatePage /> },
          { path: "/admin/employees/edit/:id", element: <AdminEmployeeEditPage /> },

          { path: "/admin/students", element: <AdminStudentsPage /> },
          { path: "/admin/students/create", element: <AdminStudentCreatePage /> },
          { path: "/admin/students/edit/:id", element: <AdminStudentEditPage /> },
          { path: "/admin/students/:id/id-card", element: <AdminStudentIdCardPage /> },

          { path: "/admin/courses", element: <AdminCoursesPage /> },
          { path: "/admin/courses/create", element: <AdminCourseCreatePage /> },
          { path: "/admin/courses/edit/:id", element: <AdminCourseEditPage /> },

          { path: "/admin/batches", element: <AcademicStructurePage /> },
          { path: "/admin/batches/create", element: <AdminBatchCreatePage /> },
          { path: "/admin/batches/edit/:id", element: <AdminBatchEditPage /> },

          { path: "/admin/terms", element: <AdminTermsPage /> },
          { path: "/admin/terms/create", element: <AdminTermCreatePage /> },
          { path: "/admin/terms/edit/:id", element: <AdminTermEditPage /> },

          { path: "/admin/subjects", element: <AdminSubjectsPage /> },
          { path: "/admin/subjects/create", element: <AdminSubjectCreatePage /> },
          { path: "/admin/subjects/edit/:id", element: <AdminSubjectEditPage /> },

          { path: "/admin/teaching-assignments", element: <AdminTeachingAssignmentsPage /> },
          { path: "/admin/teaching-assignments/create", element: <AdminTeachingAssignmentCreatePage /> },

          { path: "/admin/lookups", element: <AdminLookupsPage /> },
          { path: "/admin/lookups/create", element: <AdminLookupCreatePage /> },

          { path: "/admin/notices", element: <AdminNoticesPage /> },
          { path: "/admin/notices/create", element: <AdminNoticeCreatePage /> },
          { path: "/admin/notices/edit/:id", element: <AdminNoticeEditPage /> },

          { path: "/admin/settings", element: <AdminSettingsPage /> },
          { path: "/admin/settings/create", element: <AdminSettingCreatePage /> },
          { path: "/admin/settings/edit/:id", element: <AdminSettingEditPage /> },

          { path: "/admin/fiscal-years", element: <AdminFiscalYearsPage /> },
          { path: "/admin/fiscal-years/create", element: <AdminFiscalYearCreatePage /> },
          { path: "/admin/fiscal-years/edit/:id", element: <AdminFiscalYearEditPage /> },

          // --- Principal modules ---
          { path: "/principal/attendance", element: <PrincipalAttendancePage /> },
          { path: "/principal/results/pending", element: <PendingResultsPage /> },
          { path: "/principal/results/publish", element: <PublishResultsPage /> },
          { path: "/principal/students/approval", element: <StudentApprovalPage /> },
          { path: "/principal/notices", element: <PrincipalNoticesPage /> },
          { path: "/principal/payroll/pending", element: <PendingPayrollPage /> },
          { path: "/principal/reports", element: <PrincipalReportsPage /> },
          { path: "/principal/accountants", element: <PrincipalAccountantsPage /> },

          // --- Accountant modules ---
          { path: "/accountant/fee-structures", element: <AccountantFeeStructuresPage /> },
          { path: "/accountant/billing", element: <AccountantBillingPage /> },
          { path: "/accountant/billing/receipt/:id", element: <AccountantBillingReceiptPage /> },
          { path: "/accountant/payments", element: <AccountantPaymentsPage /> },
          { path: "/accountant/receipts", element: <AccountantReceiptsPage /> },
          { path: "/accountant/journal", element: <AccountantJournalPage /> },
          { path: "/accountant/ledgers", element: <AccountantLedgersPage /> },
          { path: "/accountant/payroll/wizard", element: <AccountantPayrollWizardPage /> },
          { path: "/accountant/payslips", element: <AccountantPayslipsPage /> },
          { path: "/accountant/accountants", element: <AccountantListPage /> },
          { path: "/accountant/create", element: <AccountantCreatePage /> },
          { path: "/accountant/edit/:id", element: <AccountantEditPage /> },
          { path: "/accountant/attendance", element: <AccountantAttendancePage /> },

          // --- Teacher modules (guarded for TEACHER) ---
          {
            element: <RequireAuth allowedRoles={["TEACHER"]} />,
            children: [
              { path: "/teacher", element: <Navigate to="/teacher/my-classes" replace /> },
              // Spec-aligned aliases (legacy implementations)
              { path: "/teacher/assignments", element: <Navigate to="/teacher/my-classes" replace /> },
              { path: "/teacher/attendance/take", element: <Navigate to="/teacher/take-attendance" replace /> },
              { path: "/teacher/students/create", element: <Navigate to="/teacher/students/add" replace /> },
              // Current teacher routes
              { path: "/teacher/my-classes", element: <TeacherMyClassesPage /> },
              { path: "/teacher/take-attendance", element: <TeacherTakeAttendancePage /> },
              { path: "/teacher/exams/create", element: <TeacherExamCreatePage /> },
              { path: "/teacher/exams/edit/:id", element: <TeacherExamEditPage /> },
              { path: "/teacher/exams", element: <TeacherExamsPage /> },
              { path: "/teacher/marks", element: <TeacherMarksEntryPage /> },
              { path: "/teacher/results", element: <TeacherResultsPage /> },
              { path: "/teacher/results/:id", element: <TeacherResultDetailPage /> },
              { path: "/teacher/exam-subjects", element: <TeacherExamSubjectsPage /> },
              { path: "/teacher/attendance-sessions", element: <TeacherAttendanceSessionsPage /> },
              { path: "/teacher/batch-pay", element: <TeacherBatchPayPage /> },
              { path: "/teacher/notices", element: <TeacherNoticesPage /> },
              { path: "/teacher/students", element: <TeacherStudentsPage /> },
              { path: "/teacher/students/add", element: <AddTeacherStudentPage /> },
              { path: "/teacher/students/edit/:id", element: <EditTeacherStudentPage /> },
              { path: "/teacher/students/:id/id-card", element: <TeacherStudentIdCardPage /> },
            ],
          },

          // --- Staff modules ---
          { path: "/staff/profile", element: <StaffProfilePage /> },
          { path: "/staff/profile/edit", element: <StaffProfileEditPage /> },
          { path: "/staff/payslips", element: <StaffPayslipsPage /> },
          { path: "/staff/payslips/:id", element: <StaffPayslipDetailPage /> },
          { path: "/staff/attendance", element: <StaffAttendancePage /> },
          { path: "/staff/leave", element: <StaffLeavePage /> },
          { path: "/staff/notices", element: <StaffNoticesPage /> },

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
  return <RouterProvider router={router} />;
}

export default AppRoutingSetup;
