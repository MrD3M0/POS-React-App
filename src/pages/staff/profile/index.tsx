import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { User } from "lucide-react";
import { toast } from "sonner";

const LIMIT = 5;

export default function StaffProfilePage() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: () => ({ profileUrl: "/staff/profile" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PROFILE[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader title="My Profile" breadCrumbItems={[{ title: "Staff", link: "/staff" }, { title: "Profile", link: "/staff/profile" }]} />
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={undefined} alt="Staff avatar" />
          <AvatarFallback>{(rows[0]?.firstName ?? "S")[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold">{rows[0]?.firstName} {rows[0]?.lastName}</h2>
          <p className="text-sm text-muted-foreground">{rows[0]?.email}</p>
          <Badge variant="outline" className="mt-1">{rows[0]?.role}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ProfileCard label="Employee ID" value={rows[0]?.employeeCode} />
        <ProfileCard label="Designation" value={rows[0]?.designation} />
        <ProfileCard label="Phone" value={rows[0]?.phone} />
        <ProfileCard label="SSF No." value={rows[0]?.ssfNo} showMasked={false} />
        <ProfileCard label="Bank Account No." value={rows[0]?.bankAccountNo} showMasked={false} />
        <ProfileCard label="PAN No." value={rows[0]?.panNo} showMasked={true} />
        <ProfileCard label="Role" value={rows[0]?.role} />
        <ProfileCard label="Department" value={rows[0]?.designation} />
      </div>
    </div>
  );
}

function ProfileCard({ label, value, showMasked = true }: { label: string; value?: string; showMasked?: boolean }) {
  const masked = showMasked && typeof value === "string" && value.length > 4 ? `${value.slice(0, 4)}…${value.slice(-2)}` : value ?? "";
  return (
    <div className="rounded-lg border p-4">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="font-medium">{masked}</p>
    </div>
  );
}
type Label = import("@/components/ui/label").LabelProps;
void Label; // avoid unused warning

type T_PROFILE = {
  id: string;
  firstName: string; lastName: string; employeeCode: string; designation: string; role: string;
  email: string; phone?: string; ssfNo?: string | null; bankAccountNo?: string | null; panNo?: string | null;
};
