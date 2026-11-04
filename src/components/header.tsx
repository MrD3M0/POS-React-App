import { User } from "lucide-react";

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

export default function Header() {
  const { logout, auth } = useAuth();
  return (
    <header className="w-full border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 w-full items-center justify-between px-4">
        {/* Brand Logo */}
        <div className="flex items-center h-14 w-14 ">
          <img
            className="object-cover rounded-full"
            src="/ZapDarkLogo.png"
            alt="Zap Logo"
          />
        </div>

        {/* User Icon Dropdown */}
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
            <DropdownMenuItem>Profile</DropdownMenuItem>
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
    </header>
  );
}
