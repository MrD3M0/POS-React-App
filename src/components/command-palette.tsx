import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleUserRound,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useAuth } from "@/auth/context/auth-context";
import { flattenNav } from "@/providers/nav-items";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTheme } from "next-themes";

/**
 * Command palette (Ctrl/⌘ + K): jump to any page of your role, run the quick
 * actions, and switch the theme without touching the mouse.
 */
export default function CommandPalette() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Ctrl/⌘ + K opens the palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const pages = useMemo(() => flattenNav(user?.role), [user?.role]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; href: string }[]>();
    for (const page of pages) {
      const list = map.get(page.group) ?? [];
      list.push({ label: page.label, href: page.href });
      map.set(page.group, list);
    }
    return [...map.entries()];
  }, [pages]);

  const roleActions = useMemo(() => {
    const actions: { label: string; href: string; icon: React.ReactNode }[] = [];
    switch (user?.role) {
      case "ADMIN":
        actions.push(
          { label: "New Student", href: "/admin/students/create", icon: <GraduationCap className="size-4" /> },
          { label: "New Notice", href: "/admin/notices/create", icon: <Search className="size-4" /> },
        );
        break;
      case "TEACHER":
        actions.push(
          { label: "Take Attendance", href: "/teacher/take-attendance", icon: <Search className="size-4" /> },
          { label: "Enter Marks", href: "/teacher/marks", icon: <Search className="size-4" /> },
          { label: "New Notice for my class", href: "/teacher/notices/create", icon: <Search className="size-4" /> },
        );
        break;
      case "ACCOUNTANT":
        actions.push(
          { label: "Fee Structures", href: "/accountant/fee-structures", icon: <Search className="size-4" /> },
          { label: "Grant Scholarship", href: "/accountant/scholarships", icon: <Search className="size-4" /> },
          { label: "Record Payment", href: "/accountant/billing", icon: <Search className="size-4" /> },
        );
        break;
      case "PRINCIPAL":
        actions.push(
          { label: "Pending Results", href: "/principal/results/pending", icon: <Search className="size-4" /> },
          { label: "Pending Payroll", href: "/principal/payroll/pending", icon: <Search className="size-4" /> },
        );
        break;
      default:
        break;
    }
    return actions;
  }, [user?.role]);

  function go(href: string) {
    setOpen(false);
    navigate(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
      title="Command palette"
      description="Search the pages and actions of your role."
      showCloseButton={false}
    >
      <CommandInput
        placeholder="Search pages and actions..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No result found.</CommandEmpty>

        {roleActions.length > 0 ? (
          <CommandGroup heading="Quick actions">
            {roleActions.map((action) => (
              <CommandItem
                key={action.href + action.label}
                value={action.label}
                onSelect={() => go(action.href)}
              >
                {action.icon}
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {grouped.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => go(item.href)}
              >
                <LayoutDashboard className="size-4 opacity-60" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem
            value="Toggle dark mode"
            onSelect={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </CommandItem>
          <CommandItem
            value="My profile"
            onSelect={() => go("/staff/profile")}
          >
            <CircleUserRound className="size-4" />
            My profile
          </CommandItem>
          <CommandItem
            value="Help"
            onSelect={() => go("/help")}
          >
            <ArrowRight className="size-4" />
            Help &amp; shortcuts
          </CommandItem>
          <CommandItem
            value="Log out"
            onSelect={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut className="size-4" />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
