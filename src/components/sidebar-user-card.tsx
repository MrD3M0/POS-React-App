import { LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SidebarUserCardProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    status?: "online" | "away" | "offline";
  };
  isCollapsed?: boolean;
  variant?: "light" | "brand" | "minimal";
  withMenu?: boolean;
  onLogout: () => void;
  className?: string;
}

const STATUS_DOT: Record<
  NonNullable<SidebarUserCardProps["user"]["status"]>,
  string
> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground/50",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * The user card at the bottom of the sidebar: avatar, name, role/email and the
 * logout button. Collapses to the avatar only, and can open a profile menu.
 */
export default function SidebarUserCard({
  user,
  isCollapsed = false,
  variant = "light",
  withMenu = false,
  onLogout,
  className,
}: SidebarUserCardProps) {
  const status = user.status ?? "online";
  const isBrand = variant === "brand";

  const avatar = (
    <span
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden text-sm font-semibold",
        isBrand
          ? "rounded-xl bg-white/20 text-primary-foreground"
          : "rounded-full bg-primary/10 text-primary",
      )}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="size-full object-cover"
        />
      ) : (
        initialsOf(user.name)
      )}
      <span
        aria-hidden
        className={cn(
          "absolute right-0 bottom-0 size-2.5 rounded-full ring-2",
          STATUS_DOT[status],
          isBrand ? "ring-primary" : "ring-card",
        )}
      />
    </span>
  );

  const logoutButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Log out"
          onClick={onLogout}
          className={cn(
            "size-8 shrink-0 cursor-pointer rounded-lg border transition-colors duration-150",
            isBrand
              ? "border-white/20 text-primary-foreground hover:bg-white/15"
              : "border-border/60 hover:bg-accent",
          )}
        >
          <LogOut className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Log out</TooltipContent>
    </Tooltip>
  );

  if (isCollapsed) {
    return (
      <div className={cn("flex flex-col items-center gap-2 border-t p-3", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              tabIndex={0}
              role={withMenu ? "button" : "img"}
              aria-label={`${user.name}${user.role ? ` · ${user.role}` : ""} · ${user.email}`}
            >
              {avatar}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">
            <p className="font-medium">{user.name}</p>
            {user.role ? <p className="text-xs opacity-80">{user.role}</p> : null}
            <p className="text-xs break-all opacity-80">{user.email}</p>
          </TooltipContent>
        </Tooltip>
        {logoutButton}
      </div>
    );
  }

  const row = (
    <div
      className={cn(
        "flex items-center gap-3 p-3 transition-colors duration-150",
        variant === "light" && "rounded-xl border bg-card shadow-sm",
        isBrand && "rounded-xl bg-primary text-primary-foreground shadow-sm",
        variant === "minimal" && "rounded-none p-0",
        withMenu &&
          "cursor-pointer hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            isBrand && "text-primary-foreground",
          )}
        >
          {user.name}
        </p>
        <p
          className={cn(
            "truncate text-xs",
            isBrand ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {user.role ? `${user.role} · ` : ""}
          {user.email}
        </p>
      </div>
      {logoutButton}
    </div>
  );

  const card = variant === "minimal" ? (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={() => window.location.assign("/help")}
            className="size-8 cursor-pointer rounded-lg border border-border/60 transition-colors duration-150 hover:bg-accent"
          >
            <Settings className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings &amp; help</TooltipContent>
      </Tooltip>
      {row}
    </div>
  ) : (
    row
  );

  if (!withMenu) return card;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{card}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => window.location.assign("/staff/profile")}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.location.assign("/help")}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={onLogout}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { SidebarUserCard };
