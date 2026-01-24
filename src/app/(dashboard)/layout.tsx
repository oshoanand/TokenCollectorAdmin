import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
// import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarNav />
        {/* <SidebarRail /> */}
      </Sidebar>
      <SidebarInset>
        {/* <Header /> */}
        <main className="p-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
