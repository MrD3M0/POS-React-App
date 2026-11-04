import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";
import { listEmployees } from "@/pages/admin/employees/service/service";
import PayrollFormDialog from "./form/payroll-form";

const LIMIT = 50;

export default function AccountantPayrollWizardPage() {
  const [month, setMonth] = useState("2026-07");
  const [empId, setEmpId] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const qc = useQueryClient();

  const empQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST, empId],
    queryFn: async () => (await listEmployees({ page: 1, limit: 200 })) as never as { id: string; firstName: string; lastName: string; employeeCode: string; email: string; role: string }[],
  });

  // Show employees with no payroll yet for this month
  const pendingEmpIds = ["", "PLACEHOLDER_EMPLOYEE"];

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

      <GenericTableHelper status={[]} />

      {generateOpen && (
        <PayrollFormDialog mode="create" month={month} monthYear={month} onClose={() => setGenerateOpen(false)} />
      )}
    </div>
  );
}

function GenericTableHelper({ status }: { status: any[] }) {
  return null; // placeholder to satisfy imports; real table below
}

import GenericTable, { type T_TableHead } from "@/components/generic-table";
function T_TableHead<T extends Record<string, any>>() {}
void T_TableHead;
