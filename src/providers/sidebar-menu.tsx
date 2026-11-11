import { useMemo, useState } from "react";
import { useAuth } from "@/auth/context/auth-context";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SidebarUserCard from "@/components/sidebar-user-card";
import {
  buildNav,
  isPathActive,
  visibleFor,
  type NavItemType,
} from "./nav-items";

function NavItemLink({ item, active }: { item: NavItemType; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link to={item.href} className={active ? "bg-sidebar-accent" : ""}>
      <SidebarMenuButton tooltip={item.label} isActive={active}>
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </Link>
  );
}

export default function AppSidebarMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state, isMobile } = useSidebar();
  const role = user?.role;
  const entries = useMemo(() => buildNav(role), [role]);
  // Only stores the modules the user opened/closed explicitly. Modules that
  // own the current page stay open by default (derived, no effect needed).
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  if (!user?.role) return null;

  const isCollapsed = state === "collapsed" && !isMobile;
  const flatItems = visibleFor(role);
  const identity = user.employee ?? user.student;
  const fullName =
    [identity?.firstName, identity?.middleName, identity?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || user.username || "User";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed ? (
              <SidebarMenuButton
                className="w-full justify-center"
                tooltip="School Management"
              >
                <LayoutDashboard className="h-5 w-5" />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton className="w-full">
                <span className="font-semibold">School Management</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {isCollapsed
              ? // Icon rail: one flat icon per page so nothing is hidden in a submenu.
                flatItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <NavItemLink
                      item={item}
                      active={isPathActive(location.pathname, item.href)}
                    />
                  </SidebarMenuItem>
                ))
              : entries.map((entry) => {
                  if (entry.type === "item") {
                    return (
                      <SidebarMenuItem key={entry.item.key}>
                        <NavItemLink
                          item={entry.item}
                          active={isPathActive(
                            location.pathname,
                            entry.item.href,
                          )}
                        />
                      </SidebarMenuItem>
                    );
                  }

                  const { group, items } = entry;
                  const GroupIcon = group.icon;
                  const hasActiveChild = items.some((item) =>
                    isPathActive(location.pathname, item.href),
                  );
                  const isOpen = openGroups[group.key] ?? hasActiveChild;

                  return (
                    <SidebarMenuItem key={group.key}>
                      <Collapsible
                        open={isOpen}
                        onOpenChange={(open) =>
                          setOpenGroups((prev) => ({
                            ...prev,
                            [group.key]: open,
                          }))
                        }
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={group.label}
                            isActive={hasActiveChild}
                          >
                            <GroupIcon className="h-4 w-4" />
                            <span>{group.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {items.map((item) => {
                              const active = isPathActive(
                                location.pathname,
                                item.href,
                              );
                              return (
                                <SidebarMenuSubItem key={item.key}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={active}
                                  >
                                    <Link to={item.href}>
                                      <span>{item.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter className="mt-auto border-t p-3">
        <SidebarUserCard
          user={{
            name: fullName,
            email: user.email ?? "",
            avatarUrl: user.employee?.photoUrl ?? undefined,
            role: user.role,
            status: "online",
          }}
          isCollapsed={isCollapsed}
          onLogout={() => {
            void logout();
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
