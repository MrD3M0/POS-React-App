import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleHelp, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/auth/context/auth-context";
import Button from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import ThemeToggle from "./theme-toggle";
import ProfileDialog from "./profile-dialog";
import NotificationBell from "./notification-bell";
import CommandPalette from "./command-palette";

export default function Header() {
  const { logout, auth } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="w-full border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Sidebar open/close (also Ctrl/Cmd + B) */}
          <SidebarTrigger aria-label="Toggle sidebar" />
          {/* Brand Logo */}
          <div className="flex items-center h-14 w-14 ">
            <img
              className="object-cover rounded-full"
              src="/ZapDarkLogo.png"
              alt="Zap Logo"
            />
          </div>
        </div>

        {/* Theme switch + help + notifications + user menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer rounded-full border bg-muted"
            asChild
          >
            <Link to="/help" aria-label="Help">
              <CircleHelp className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full border bg-muted"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {auth?.user?.username || "User"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/help">Help &amp; shortcuts</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile dialog with the account / ID details */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      {/* Command palette (Ctrl/⌘ + K) */}
      <CommandPalette />
    </header>
  );
}
