import { useState } from "react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const REPORTS = [
  { title: "Student Overview", metric: "Students by Status" },
  { title: "Employee Overview", metric: "Employees by Role" },
  { title: "Attendance Summary", metric: "Present / Absent / Leave" },
  { title: "Fee Collection", metric: "Collected vs Outstanding" },
  { title: "Financial Summary", metric: "Revenue by Source" },
];

export default function PrincipalReportsPage() {
  const [tab, setTab] = useState(0);
  const metrics = ["Students by Status", "Employees by Role", "Attendance Summary"];

  const data = REPORTS.map((r) => ({ name: r.title, value: Math.floor(Math.random() * 100) }));

  return (
    <div className="p-5">
      <PageHeader
        title="Reports"
        breadCrumbItems={[{ title: "Principal", link: "/principal" }, { title: "Reports", link: "/principal/reports" }]}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {REPORTS.map((r, i) => (
          <button key={r.title} onClick={() => setTab(i)} className={`rounded px-3 py-1 text-sm font-medium ${tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {r.title}
          </button>
        ))}
      </div>
      <div className="rounded-lg border p-6 mb-4">
        <h3 className="font-semibold text-base mb-4">{metrics[tab] ?? "Report"}</h3>
        <div style={{ width: "100%", height: 300 }}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#198754" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
