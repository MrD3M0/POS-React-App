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
// Public registration removed: only ADMIN creates accounts.

import DashboardPage from "@/pages/dashboard/dashboard-page";
import RoleDashboardRedirect, {
  RoleOnly,
} from "@/pages/dashboard/role-dashboard-redirect";
import AdminDashboardPage from "@/pages/admin/dashboard/index";
import PrincipalDashboardPage from "@/pages/principal/dashboard/index";
import StaffDashboardPage from "@/pages/staff/dashboard/index";
import HelpPage from "@/pages/help/index";
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
import AdminTermSubjectsPage from "@/pages/admin/terms/subjects/index";
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
import AdminAuditPage from "@/pages/admin/audit/index";
import AdminHolidaysPage from "@/pages/admin/holidays/index";
import AdminFiscalYearsPage from "@/pages/admin/fiscal-years/index";
import AdminFiscalYearCreatePage from "@/pages/admin/fiscal-years/create";
import AdminFiscalYearEditPage from "@/pages/admin/fiscal-years/edit";

// --- Principal pages ---
import PrincipalAttendancePage from "@/pages/principal/attendance/index";
import PendingResultsPage from "@/pages/principal/results/pending/index";
import PublishResultsPage from "@/pages/principal/results/publish/index";
import StudentApprovalPage from "@/pages/principal/students/approval/index";
import PrincipalNoticesPage from "@/pages/principal/notices/index";
import CreatePrincipalNoticePage from "@/pages/principal/notices/create";
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
import AccountantAttendancePage from "@/pages/accountant/attendance/index";
import AccountantNoticesPage from "@/pages/accountant/notices/index";
import CreateAccountantNoticePage from "@/pages/accountant/notices/create";
import AccountantScholarshipsPage from "@/pages/accountant/scholarships/index";
import AccountantDashboardPage from "@/pages/accountant/dashboard/index";
import AccountantBillingPage from "@/pages/accountant/billing/index";
import AccountantFeePaymentsPage from "@/pages/accountant/billing/payments";
import AccountantInstallmentsPage from "@/pages/accountant/billing/installments";
import RecordFeePaymentPage from "@/pages/accountant/billing/record";
import AccountantBillingReceiptPage from "@/pages/accountant/billing/receipt/index";

// --- Teacher pages ---
import TeacherDashboardPage from "@/pages/teacher/dashboard/index";
import TeacherMyClassesPage from "@/pages/teacher/my-classes/index";
import TeacherTakeAttendancePage from "@/pages/teacher/take-attendance/index";
import TeacherExamsPage from "@/pages/teacher/exams/index";
import TeacherExamCreatePage from "@/pages/teacher/exams/create/index";
import TeacherExamEditPage from "@/pages/teacher/exams/edit/index";
import TeacherMarksEntryPage from "@/pages/teacher/marks/index";
import TeacherMarksSubmissionPage from "@/pages/teacher/marks-submission/index";
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
import CreateTeacherNoticePage from "@/pages/teacher/notices/create";

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
      // /register removed: public registration is disabled.
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
          // `/dashboard` forwards every role to its own dashboard.
          { path: "/dashboard", element: <RoleDashboardRedirect /> },
          { path: "/help", element: <HelpPage /> },
          {
            path: "/notices",
            element: (
              <Can permission="system:notices:read">
                <DashboardPage />
              </Can>
            ),
          },

          // --- Admin modules ---
          { path: "/admin", element: (
            <RoleOnly roles={["ADMIN"]}>
              <AdminDashboardPage />
            </RoleOnly>
          ) },
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/users/create", element: <AdminUserCreatePage /> },

          { path: "/admin/employees", element: <AdminEmployeesPage /> },
          {
            path: "/admin/employees/create",
            element: <AdminEmployeeCreatePage />,
          },
          {
            path: "/admin/employees/edit/:id",
            element: <AdminEmployeeEditPage />,
          },

          { path: "/admin/students", element: <AdminStudentsPage /> },
          {
            path: "/admin/students/create",
            element: <AdminStudentCreatePage />,
          },
          {
            path: "/admin/students/edit/:id",
            element: <AdminStudentEditPage />,
          },
          {
            path: "/admin/students/:id/id-card",
            element: <AdminStudentIdCardPage />,
          },

          { path: "/admin/courses", element: <AdminCoursesPage /> },
          { path: "/admin/courses/create", element: <AdminCourseCreatePage /> },
          { path: "/admin/courses/edit/:id", element: <AdminCourseEditPage /> },

          { path: "/admin/batches", element: <AcademicStructurePage /> },
          { path: "/admin/batches/create", element: <AdminBatchCreatePage /> },
          { path: "/admin/batches/edit/:id", element: <AdminBatchEditPage /> },

          { path: "/admin/terms", element: <AdminTermsPage /> },
          { path: "/admin/terms/create", element: <AdminTermCreatePage /> },
          { path: "/admin/terms/edit/:id", element: <AdminTermEditPage /> },
          {
            path: "/admin/terms/:id/subjects",
            element: <AdminTermSubjectsPage />,
          },

          { path: "/admin/subjects", element: <AdminSubjectsPage /> },
          {
            path: "/admin/subjects/create",
            element: <AdminSubjectCreatePage />,
          },
          {
            path: "/admin/subjects/edit/:id",
            element: <AdminSubjectEditPage />,
          },

          {
            path: "/admin/teaching-assignments",
            element: <AdminTeachingAssignmentsPage />,
          },
          {
            path: "/admin/teaching-assignments/create",
            element: <AdminTeachingAssignmentCreatePage />,
          },

          { path: "/admin/lookups", element: <AdminLookupsPage /> },
          { path: "/admin/lookups/create", element: <AdminLookupCreatePage /> },

          { path: "/admin/notices", element: <AdminNoticesPage /> },
          { path: "/admin/notices/create", element: <AdminNoticeCreatePage /> },
          { path: "/admin/notices/edit/:id", element: <AdminNoticeEditPage /> },

          { path: "/admin/settings", element: <AdminSettingsPage /> },
          {
            path: "/admin/settings/create",
            element: <AdminSettingCreatePage />,
          },
          {
            path: "/admin/settings/edit/:id",
            element: <AdminSettingEditPage />,
          },

          { path: "/admin/audit", element: <AdminAuditPage /> },
          { path: "/admin/holidays", element: <AdminHolidaysPage /> },

          { path: "/admin/fiscal-years", element: <AdminFiscalYearsPage /> },
          {
            path: "/admin/fiscal-years/create",
            element: <AdminFiscalYearCreatePage />,
          },
          {
            path: "/admin/fiscal-years/edit/:id",
            element: <AdminFiscalYearEditPage />,
          },

          // --- Principal modules ---
          { path: "/principal", element: (
            <RoleOnly roles={["PRINCIPAL", "ADMIN"]}>
              <PrincipalDashboardPage />
            </RoleOnly>
          ) },
          {
            path: "/principal/attendance",
            element: <PrincipalAttendancePage />,
          },
          {
            path: "/principal/results/pending",
            element: <PendingResultsPage />,
          },
          {
            path: "/principal/results/publish",
            element: <PublishResultsPage />,
          },
          {
            path: "/principal/students/approval",
            element: <StudentApprovalPage />,
          },
          { path: "/principal/notices", element: <PrincipalNoticesPage /> },
          {
            path: "/principal/notices/create",
            element: <CreatePrincipalNoticePage />,
          },
          {
            path: "/principal/payroll/pending",
            element: <PendingPayrollPage />,
          },
          { path: "/principal/reports", element: <PrincipalReportsPage /> },
          {
            path: "/principal/accountants",
            element: <PrincipalAccountantsPage />,
          },

          // --- Accountant modules ---
          { path: "/accountant", element: (
            <RoleOnly roles={["ACCOUNTANT", "ADMIN", "PRINCIPAL"]}>
              <AccountantDashboardPage />
            </RoleOnly>
          ) },
          {
            path: "/accountant/fee-structures",
            element: <AccountantFeeStructuresPage />,
          },
          { path: "/accountant/billing", element: <AccountantBillingPage /> },
          {
            path: "/accountant/billing/payments",
            element: <AccountantFeePaymentsPage />,
          },
          {
            path: "/accountant/billing/installments",
            element: <AccountantInstallmentsPage />,
          },
          {
            path: "/accountant/billing/record",
            element: <RecordFeePaymentPage />,
          },
          {
            path: "/accountant/billing/receipt/:id",
            element: <AccountantBillingReceiptPage />,
          },
          { path: "/accountant/payments", element: <AccountantPaymentsPage /> },
          { path: "/accountant/receipts", element: <AccountantReceiptsPage /> },
          { path: "/accountant/journal", element: <AccountantJournalPage /> },
          { path: "/accountant/ledgers", element: <AccountantLedgersPage /> },
          {
            path: "/accountant/payroll/wizard",
            element: <AccountantPayrollWizardPage />,
          },
          { path: "/accountant/payslips", element: <AccountantPayslipsPage /> },
          { path: "/accountant/accountants", element: <AccountantListPage /> },
          { path: "/accountant/create", element: <AccountantCreatePage /> },
          {
            path: "/accountant/attendance",
            element: <AccountantAttendancePage />,
          },
          {
            // Batch pay management (ADMIN / ACCOUNTANT). Teachers only get the
            // read-only view at /teacher/batch-pay.
            path: "/accountant/batch-pay",
            element: <TeacherBatchPayPage />,
          },
          {
            path: "/accountant/notices",
            element: <AccountantNoticesPage />,
          },
          {
            path: "/accountant/notices/create",
            element: <CreateAccountantNoticePage />,
          },
          {
            path: "/accountant/scholarships",
            element: <AccountantScholarshipsPage />,
          },
          {
            path: "/accountant/dashboard",
            element: <AccountantDashboardPage />,
          },

          // --- Teacher modules (guarded for TEACHER) ---
          {
            element: <RequireAuth allowedRoles={["TEACHER"]} />,
            children: [
              {
                path: "/teacher",
                element: <Navigate to="/teacher/dashboard" replace />,
              },
              // Spec-aligned aliases (legacy implementations)
              {
                path: "/teacher/assignments",
                element: <Navigate to="/teacher/my-classes" replace />,
              },
              {
                path: "/teacher/attendance/take",
                element: <Navigate to="/teacher/take-attendance" replace />,
              },
              {
                path: "/teacher/students/create",
                element: <Navigate to="/teacher/students/add" replace />,
              },
              // Current teacher routes
              { path: "/teacher/dashboard", element: <TeacherDashboardPage /> },
              {
                path: "/teacher/my-classes",
                element: <TeacherMyClassesPage />,
              },
              {
                path: "/teacher/take-attendance",
                element: <TeacherTakeAttendancePage />,
              },
              {
                path: "/teacher/exams/create",
                element: <TeacherExamCreatePage />,
              },
              {
                path: "/teacher/exams/edit/:id",
                element: <TeacherExamEditPage />,
              },
              { path: "/teacher/exams", element: <TeacherExamsPage /> },
              { path: "/teacher/marks", element: <TeacherMarksEntryPage /> },
              {
                path: "/teacher/marks/submit",
                element: <TeacherMarksSubmissionPage />,
              },
              { path: "/teacher/results", element: <TeacherResultsPage /> },
              {
                path: "/teacher/results/:id",
                element: <TeacherResultDetailPage />,
              },
              {
                path: "/teacher/exam-subjects",
                element: <TeacherExamSubjectsPage />,
              },
              {
                path: "/teacher/attendance-sessions",
                element: <TeacherAttendanceSessionsPage />,
              },
              { path: "/teacher/batch-pay", element: <TeacherBatchPayPage /> },
              { path: "/teacher/notices", element: <TeacherNoticesPage /> },
              {
                path: "/teacher/notices/create",
                element: <CreateTeacherNoticePage />,
              },
              { path: "/teacher/students", element: <TeacherStudentsPage /> },
              {
                path: "/teacher/students/add",
                element: <AddTeacherStudentPage />,
              },
              {
                path: "/teacher/students/edit/:id",
                element: <EditTeacherStudentPage />,
              },
              {
                path: "/teacher/students/:id/id-card",
                element: <TeacherStudentIdCardPage />,
              },
            ],
          },

          // --- Staff modules ---
          { path: "/staff", element: (
            <RoleOnly roles={["STAFF", "ADMIN"]}>
              <StaffDashboardPage />
            </RoleOnly>
          ) },
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
