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

  const statusTone = (status: Service["status"]) => {
    if (status === "online") return "bg-emerald-500/80";
    if (status === "offline" || status === "stopped") return "bg-amber-500/80";
    return "bg-gray-400/80";
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton size="lg" className="items-center">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent/80">
            <Server />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-xs uppercase text-muted-foreground">
              Tenant control plane
            </span>
            <span className="truncate font-semibold text-foreground">
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
        <div className="mt-4 px-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Tenant services</span>
            <Link
              href="/services/new"
              className={`rounded-full border px-2 py-1 text-[11px] font-medium transition ${
                readOnly
                  ? "pointer-events-none border-muted-foreground/30 text-muted-foreground"
                  : "border-sidebar-border hover:bg-sidebar-accent/70"
              }`}
              aria-disabled={readOnly}
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-2 space-y-1 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 p-2">
            {isLoading && (
              <div className="rounded-md bg-sidebar-accent/60 px-2 py-1.5 text-xs text-muted-foreground">
                Loading…
              </div>
            )}

            {services.map((service: Service) => {
              const active = pathname === `/services/${service.name}`;

              return (
                <Link
                  key={service.name}
                  href={`/services/${service.name}`}
                  className={`group flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition
                  ${
                    active
                      ? "border-sidebar-border bg-sidebar-accent shadow-sm"
                      : "border-transparent hover:border-sidebar-border/60 hover:bg-sidebar-accent/60"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusTone(service.status)}`}
                      aria-label={service.status}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{service.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {service.status === "online" ? "Running" : "Stopped"}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground group-hover:text-foreground">
                    {active ? "Active" : "Open"}
                  </span>
                </Link>
              );
            })}

            {!isLoading && services.length === 0 && (
              <div className="rounded-md border border-dashed border-sidebar-border/80 bg-sidebar-accent/30 px-3 py-2 text-xs text-muted-foreground">
                No tenant services yet.
              </div>
            )}
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
      <SidebarFooter className="space-y-3 px-3 pb-6">
        <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-[11px] font-semibold uppercase text-destructive">
            Danger zone
          </p>
          <p className="text-xs text-destructive/90">
            Regenerates the ecosystem file and reloads PM2. Requires confirmation.
          </p>
          <ApplyReloadButton />
        </div>

        <div className="rounded-lg border bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground">
          <div className="font-semibold uppercase text-[11px] text-foreground">
            Drift status
          </div>
          <DriftIndicator />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
