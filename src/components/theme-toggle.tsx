import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Button from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * Light / dark / system switch (shadcn "dashboard-01" style dropdown).
 * The trigger icon follows the resolved theme and the active option is
 * marked in the menu.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const activeTheme = theme ?? "system";
  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
        >
          {/* One icon only: moon while dark, sun while light. */}
          {isDark ? (
            <Moon className="size-[1.2rem]" />
          ) : (
            <Sun className="size-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEME_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              activeTheme === option.value &&
                "bg-accent text-accent-foreground",
            )}
          >
            <option.icon className="size-4" />
            {option.label}
            {activeTheme === option.value ? (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
