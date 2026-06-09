import * as React from "react";

import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  PackageIcon,
  TagsIcon,
  TruckIcon,
  ShelvingUnit,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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

    {
      title: "Inventory",
      url: "/inventory",
      icon: ShelvingUnit,
    },
    {
      title: "Suppliers",
      url: "/pos/suppliers",
      icon: TruckIcon,
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

      <SidebarFooter>
        <NavUser user={posSidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
