import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { QUERY_KEYS } from "@/lib/query-keys";
import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function getTotal(data: unknown): number {
  try {
    const d = data as { data?: { pagination?: { total?: number }; data?: unknown[] } | unknown[] } | undefined;
    if (d?.data && !Array.isArray(d.data) && typeof d.data.pagination?.total === "number") {
      return d.data.pagination.total;
    }
    if (Array.isArray(d?.data)) return d.data.length;
    if (Array.isArray((d as { data?: { data?: unknown[] } } | undefined)?.data?.data)) {
      return (d as { data: { data: unknown[] } }).data.data.length;
    }
    if (Array.isArray(data)) return data.length;
  } catch {
    return 0;
  }
  return 0;
}

export default function PrincipalReportsPage() {
  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "students"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${UrlConstants.STUDENT_URL}`, { params: { page: 1, limit: 1 } });
      return res.data;
    },
  });

  const employeesQuery = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "employees"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${UrlConstants.EMPLOYEE_URL}`, { params: { page: 1, limit: 1 } });
      return res.data;
    },
  });

  const attendanceQuery = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "attendance"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${UrlConstants.EMPLOYEE_ATTENDANCE_URL}`, { params: { page: 1, limit: 1 } });
      return res.data;
    },
  });

  const paymentsQuery = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "payments"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${UrlConstants.FEE_PAYMENT_URL}`, { params: { page: 1, limit: 1 } });
      return res.data;
    },
  });

  const isLoading = studentsQuery.isLoading || employeesQuery.isLoading || attendanceQuery.isLoading || paymentsQuery.isLoading;
  const isError = studentsQuery.isError && employeesQuery.isError && attendanceQuery.isError && paymentsQuery.isError;

  if (isLoading) return <ScreenLoader />;
  if (isError) return <AlertHandler variant="error" />;

  const studentsTotal = getTotal(studentsQuery.data);
  const employeesTotal = getTotal(employeesQuery.data);
  const attendanceTotal = getTotal(attendanceQuery.data);
  const paymentsTotal = getTotal(paymentsQuery.data);

  const cards = [
    { title: "Students", value: studentsTotal },
    { title: "Employees", value: employeesTotal },
    { title: "Attendance Records", value: attendanceTotal },
    { title: "Fee Payments", value: paymentsTotal },
  ];

  const data = [
    { name: "Students", value: studentsTotal },
    { name: "Employees", value: employeesTotal },
    { name: "Attendance", value: attendanceTotal },
    { name: "Fee Payments", value: paymentsTotal },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Reports"
        breadCrumbItems={[{ title: "Principal", link: "/principal" }, { title: "Reports", link: "/principal/reports" }]}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{c.title}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold text-base mb-4">Overview by Count</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#198754" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
