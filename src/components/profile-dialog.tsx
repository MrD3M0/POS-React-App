import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  Copy,
  IdCard,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import AlertHandler from "@/components/common/alert-handler";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCurrentUser } from "@/auth/service/service";
import { useAuth } from "@/auth/context/auth-context";
import type { UserModel } from "@/lib/models";

function fullName(user?: UserModel | null): string {
  const parts = user?.employee ?? user?.student;
  const name = [parts?.firstName, parts?.middleName, parts?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || user?.username || "User";
}

function initials(user?: UserModel | null): string {
  const parts = user?.employee ?? user?.student;
  const first = parts?.firstName?.trim().charAt(0) ?? "";
  const last = parts?.lastName?.trim().charAt(0) ?? "";
  return (
    `${first}${last}`.toUpperCase() ||
    (user?.username?.charAt(0) ?? "?").toUpperCase()
  );
}

function roleLabel(role?: string): string {
  if (!role) return "—";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

/** One "ID detail" row. */
function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span
        className={
          mono
            ? "max-w-[60%] truncate text-right font-mono text-xs text-foreground"
            : "max-w-[60%] truncate text-right text-sm font-medium text-foreground"
        }
        title={value ?? undefined}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/**
 * Profile dialog: shows the signed-in user's ID details (account id, employee
 * code / registration number, contact details and role).
 */
export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user: authUser } = useAuth();

  const query = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER],
    queryFn: getCurrentUser,
    enabled: open,
    staleTime: 60_000,
  });

  const user = query.data?.data ?? authUser;
  const employee = user?.employee ?? null;
  const student = user?.student ?? null;
  const idCode = employee?.employeeCode ?? student?.universityRegNo ?? null;

  const copy = async (value?: string | null, label?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label ?? "Value"} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            Your account and ID details as registered in the system.
          </DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : query.isError ? (
          <AlertHandler
            variant="error"
            title="Could not load your profile"
            message="Please try again."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(user)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {fullName(user)}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="secondary">{roleLabel(user?.role)}</Badge>
                  {user?.isEmailVerified ? (
                    <Badge variant="success" className="gap-1">
                      <BadgeCheck className="size-3" />
                      Verified
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="divide-y">
              <DetailRow
                icon={IdCard}
                label={employee ? "Employee code" : "Registration no."}
                value={idCode}
                mono
              />
              <DetailRow
                icon={UserIcon}
                label="Username"
                value={user?.username}
              />
              <DetailRow icon={Mail} label="Email" value={user?.email} />
              <DetailRow
                icon={Phone}
                label="Phone"
                value={employee?.phone ?? student?.phone}
              />
              {employee?.designation ? (
                <DetailRow
                  icon={BadgeCheck}
                  label="Designation"
                  value={employee.designation}
                />
              ) : null}
              <DetailRow icon={IdCard} label="User ID" value={user?.id} mono />
            </div>

            {user?.id ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => copy(user?.id, "User ID")}
              >
                <Copy className="size-3.5" />
                Copy user ID
              </Button>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileDialog;
