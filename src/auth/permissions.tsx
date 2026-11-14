import { clsx } from "clsx";
import type { PermissionKey } from "@/auth/permission-map";
import { useCan } from "@/auth/use-can";

// Minimal <Can> render-prop without pulling in React-router redirect logic:
// renders children only when the current user holds the permission; else renders
// nothing (parent is responsible for checking roles via RequireAuth).
export function Can({
  permission,
  children,
}: {
  permission: PermissionKey;
  children: React.ReactNode;
}) {
  if (useCan(permission)) return <>{children}</>;
  return null;
}

// Render an admin nav item.
export function NavItem({
  label,
  icon,
  href,
  onClick,
}: {
  permission?: PermissionKey;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {onClick ? (
        <button
          className={clsx(
            "block rounded px-3 py-1.5 text-sm font-medium hover:bg-muted",
          )}
          onClick={onClick}
        >
          {label}
        </button>
      ) : href ? (
        <a
          className="block rounded px-3 py-1.5 text-sm font-medium hover:bg-muted"
          href={href}
        >
          {label}
        </a>
      ) : null}
    </li>
  );
}
