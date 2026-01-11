"use client";

import * as React from "react";
import { Bot, Server, Settings2, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { useServicesSidebar } from "@/hooks/useServicesSidebar";
import { DriftIndicator } from "./drift-indicator";
import { ApplyReloadButton } from "./apply-reload-button";
import { useSettings } from "@/hooks/useSettings";

interface Service {
  name: string;
  status: "online" | "offline";
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { services, isLoading } = useServicesSidebar();
  const { settings } = useSettings();
  const readOnly = settings?.readOnly;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton size="lg">
          <div className="flex size-8 items-center justify-center rounded-lg">
            <Server />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">ControlDeck</span>
            <span className="truncate text-xs">
              {process.env.NEXT_PUBLIC_SERVER_NAME} Server
            </span>
            {readOnly && (
              <span className="text-[10px] font-medium text-yellow-600">
                Read-only mode
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        {/* Static section */}
        <NavMain
          items={[
            {
              title: "System Monitor",
              url: "/system-monitor",
              icon: Bot,
            },
          ]}
        />

        {/* Tenant Services */}
        <div className="mt-4 px-2">
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted-foreground">
            <span>Tenant Services</span>
            <Link
              href="/services/new"
              className={readOnly ? "pointer-events-none opacity-50" : ""}
              aria-disabled={readOnly}
            >
              <Plus className="h-4 w-4 cursor-pointer hover:text-foreground" />
            </Link>
          </div>

          <div className="mt-2 space-y-1">
            {isLoading && (
              <div className="px-2 text-xs text-muted-foreground">Loading…</div>
            )}

            {services.map((service: Service) => {
              const active = pathname === `/services/${service.name}`;

              return (
                <Link
                  key={service.name}
                  href={`/services/${service.name}`}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm
                    ${
                      active
                        ? "bg-sidebar-accent"
                        : "hover:bg-sidebar-accent/50"
                    }
                  `}
                >
                  {/* status dot */}
                  <span
                    className={`h-2 w-2 rounded-full ${
                      service.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />

                  <span className="truncate">{service.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Management Console */}
        <NavMain
          items={[
            {
              title: "Management Console",
              icon: Settings2,
              url: "/settings",
              items: [
                {
                  title: "Services",
                  url: "/services",
                },
                {
                  title: "Users",
                  url: "/users",
                },
              ],
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3">
          <ApplyReloadButton />
        </div>

        <div className="text-xs text-center">
          Drift Status: <DriftIndicator />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
