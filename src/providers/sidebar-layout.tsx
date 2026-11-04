import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import SidebarMenu from "@/providers/sidebar-menu";

export default function SidebarLayout() {
  return (
    <SidebarProvider>
      <SidebarMenu />
      <SidebarInset>
        <Header />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}