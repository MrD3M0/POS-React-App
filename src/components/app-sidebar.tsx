import * as React from "react";

import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  PackageIcon,
  TagsIcon,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,

} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";

const posSidebarData = {
  user: {
    name: "Cashier",
    email: "cashier@yourstore.com",
    avatar: "/avatars/cashier.jpg",
  },

  // Primary navigation (top)
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Categories",
      url: "/category",
      icon: TagsIcon,
    },
    {
      title: "Products",
      url: "/product",
      icon: PackageIcon,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: ShoppingCartIcon,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {open && (
              <SidebarMenuButton className="w-full flex justify-between">
                <span>Zap Point Of Sale</span>
                <SidebarTrigger />
              </SidebarMenuButton>
            )}

            {!open && <SidebarTrigger />}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={posSidebarData.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
