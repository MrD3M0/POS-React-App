import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import QUERY_KEYS from "@/lib/query-keys";
import { listEmployees } from "@/pages/admin/employees/service/service";
import PayrollFormDialog from "./form/payroll-form";

const LIMIT = 50;

export default function AccountantPayrollWizardPage() {
  const [month, setMonth] = useState("2026-07");
  const [empId, setEmpId] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);

  const empQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST, empId],
    queryFn: async () => (await listEmployees({ page: 1, limit: 200 })) as { id: string; firstName: string; lastName: string; employeeCode: string; email: string; role: string }[],
  });

  const employees = empQuery.data ?? [];

  if (empQuery.isLoading) return <ScreenLoader />;
  if (empQuery.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Payroll Wizard"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Payroll Wizard", link: "/accountant/payroll/wizard" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Select month..." value={month} onChange={(e) => setMonth(e.target.value)} />
        <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>Generate Payroll</Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "employeeCode", headName: "Employee Code", minWidth: 180 },
          { key: "firstName", headName: "First Name", minWidth: 200 },
          { key: "lastName", headName: "Last Name", minWidth: 200 },
          { key: "email", headName: "Email", minWidth: 250 },
          { key: "role", headName: "Role", minWidth: 150 },
        ]}
        data={employees}
        emptyTitle="No employees found."
        pagination={{ page: 1, limit: LIMIT, total: employees.length, onPageChange: () => {} }}
        searchPlaceholder="Search employees..."
        renderRow={(e: { id: string; firstName: string; lastName: string; employeeCode: string; email: string; role: string }) => ({
          employeeCode: e.employeeCode, firstName: e.firstName, lastName: e.lastName, email: e.email, role: e.role,
        } as Record<string, React.ReactNode>)}
      />

      {generateOpen && (
        <PayrollFormDialog mode="create" month={month} monthYear={month} onClose={() => setGenerateOpen(false)} />
      )}
    </div>
  );
}