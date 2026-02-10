"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

type ServiceSummary = {
  name: string;
  enabled: boolean;
  desiredPort?: number;
  status: string;
  cpu: number;
  memory: number;
  drift: boolean;
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionToConfirm, setActionToConfirm] = useState<
    "start" | "stop" | "restart" | null
  >(null);
  const [processing, setProcessing] = useState(false);
  const { settings } = useSettings();
  const readOnly = settings?.readOnly;
  const { user, isLoading: authLoading } = useAuth();
  const canRead = hasPermission(user, "services:read");
  const canControl = hasPermission(user, "services:control");

  const selectedList = useMemo(() => Array.from(selected), [selected]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services/with-status");
      const data = await res.json();
      setServices(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load services"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canRead) {
      load();
    }
  }, [canRead]);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === services.length) {
        return new Set();
      }
      return new Set(services.map((s) => s.name));
    });
  }

  async function performAction() {
    if (!actionToConfirm) return;
    setProcessing(true);
    setError(null);

    const res = await fetch("/api/services/bulk-control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: actionToConfirm,
        names: selectedList,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to run action");
    } else {
      await load();
      setSelected(new Set());
    }

    setProcessing(false);
    setActionToConfirm(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Services</h1>
        <p className="text-sm text-muted-foreground">
          Select multiple services to start, stop, or restart them in bulk.
          Actions affect the PM2 runtime only and do not regenerate the
          ecosystem file.
        </p>
        {readOnly && (
          <p className="text-sm text-yellow-700">
            Read-only mode enabled. Runtime actions are disabled.
          </p>
        )}
        {!canControl && (
          <p className="text-sm text-muted-foreground">
            You can view services but lack permission to control runtime state.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!canRead && !authLoading && (
        <p className="text-sm text-muted-foreground">
          You do not have permission to view services.
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.size === services.length && services.length > 0}
            onChange={toggleAll}
            disabled={loading || !canControl || readOnly}
          />
          <span>Select all</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading || !canRead}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-2 rounded-md border">
        {loading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!loading &&
          services.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between border-t px-3 py-2 first:border-t-0"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(s.name)}
                  onChange={() => toggle(s.name)}
                  disabled={loading || readOnly || !canControl}
                />
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Status: {s.status} • Port: {s.desiredPort ?? "—"} •{" "}
                    {s.enabled ? "Enabled" : "Disabled"}
                    {s.drift ? " • Drift detected" : ""}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                CPU: {s.cpu}% • Memory: {(s.memory / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          ))}

        {!loading && services.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No services configured yet.
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
          <span className="text-sm">
            {selected.size} service{selected.size > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActionToConfirm("start")}
            disabled={readOnly || processing || !canControl}
          >
            Start selected
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActionToConfirm("restart")}
            disabled={readOnly || processing || !canControl}
          >
            Restart selected
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setActionToConfirm("stop")}
            disabled={readOnly || processing || !canControl}
          >
            Stop selected
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!actionToConfirm}
        onOpenChange={(open) => {
          if (!open) setActionToConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm bulk action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm
                ? `Are you sure you want to ${actionToConfirm} ${selected.size} service${
                    selected.size > 1 ? "s" : ""
                  }? This only affects the PM2 runtime.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performAction}
              disabled={processing || readOnly || !canControl}
            >
              {processing ? "Working…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
