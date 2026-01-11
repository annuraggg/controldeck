"use client";

import * as React from "react";
import { Bot, Server, Settings2, SquareTerminal } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";


const data = {
  navMain: [
    {
      title: "System Monitor",
      url: "system-monitor",
      icon: Bot,
    },
    {
      title: "Tenant Servers",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Management Console",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Manage Tenant Servers",
          url: "tenant-servers",
        },
        {
          title: "Masnage Users",
          url: "users",
        },
        {
          title: "Audit Logs",
          url: "audit-logs",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="text-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-lg">
            <Server />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">ControlDeck</span>
            <span className="truncate text-xs">
              {process.env.NEXT_PUBLIC_SERVER_NAME} Server
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
