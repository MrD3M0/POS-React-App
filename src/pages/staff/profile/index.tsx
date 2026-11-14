import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getOwnStaff } from "./service/service";

export default function StaffProfilePage() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: getOwnStaff,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const staff = query.data?.data;
  const employee = staff?.employee ?? {};

  if (!staff?.id) return <AlertHandler variant="error" />;

  const text = (v: unknown): string => (typeof v === "string" ? v : "");
  const fullName = [text(employee.firstName), text(employee.lastName)].filter(Boolean).join(" ") || "Staff";
  const designation = text(employee.designation) || text(staff.designation);
  const department = text(staff.department) || text(employee.department);
  const phone = text(employee.phone) || text(staff.phone);
  const address = text(employee.permanentAddress) || text(employee.temporaryAddress) || text(staff.address);
  const email = text(employee.email) || text(staff.email);
  const role = text(staff.role) || text(employee.role);
  const isActive =
    typeof employee.isActive === "boolean"
      ? employee.isActive
      : typeof staff.isActive === "boolean"
        ? staff.isActive
        : staff.status !== "INACTIVE";

  return (
    <div className="p-5">
      <PageHeader
        title="My Profile"
        breadCrumbItems={[
          { title: "Staff", link: "/staff/profile" },
          { title: "Profile", link: "/staff/profile" },
        ]}
        actions={
          <Link to="/staff/profile/edit">
            <Button type="button">Edit</Button>
          </Link>
        }
      />
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={undefined} alt="Staff avatar" />
          <AvatarFallback>{(employee.firstName ?? "S")[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{role}</Badge>
            <Badge variant={isActive ? "success" : "outline"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ProfileCard label="Employee ID" value={text(employee.employeeCode)} />
        <ProfileCard label="Designation" value={designation} />
        <ProfileCard label="Department" value={department} />
        <ProfileCard label="Phone" value={phone} />
        <ProfileCard label="Address" value={address} />
        <ProfileCard label="SSF No." value={text(employee.ssfNo)} showMasked={false} />
        <ProfileCard label="Bank Account No." value={text(employee.bankAccountNo)} showMasked={false} />
        <ProfileCard label="PAN No." value={text(employee.panNo)} showMasked={true} />
        <ProfileCard label="Role" value={role} />
      </div>
    </div>
  );
}

function ProfileCard({ label, value, showMasked = true }: { label: string; value?: string | null; showMasked?: boolean }) {
  const masked = showMasked && typeof value === "string" && value.length > 4 ? `${value.slice(0, 4)}…${value.slice(-2)}` : value ?? "";
  return (
    <div className="rounded-lg border p-4">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="font-medium">{masked}</p>
    </div>
  );
}
