"use client";

import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";

const pageLabels: Record<string, string> = {
  "/": "Overview",
  "/services": "Services",
  "/users": "Users",
  "/settings": "Settings",
  "/docs": "Documentation",
  "/system-monitor": "System Monitor",
};

export function AppTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const section = pageLabels[pathname] ?? "ControlDeck";

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">ControlDeck</p>
        <h1 className="text-lg font-semibold">{section}</h1>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <Badge variant="secondary" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            {user.username} · {user.role}
          </Badge>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}
