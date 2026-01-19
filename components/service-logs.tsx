"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

type LogSchema = {
  at: string;
  data: string;
};

export function ServiceLogs({ name }: { name: string }) {
  const [logs, setLogs] = useState<LogSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const canViewLogs = hasPermission(user, "services:logs");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/services/${name}/logs?lines=200`);
    const data = await res.json();
    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    if (canViewLogs) {
      load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, canViewLogs]);

  if (authLoading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Logs</h2>
            <p className="text-xs text-muted-foreground">Loading access…</p>
          </div>
        </div>
      </section>
    );
  }

  if (!canViewLogs) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Logs</h2>
            <p className="text-xs text-muted-foreground">
              Log viewing is restricted for this account.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Logs</h2>
          <p className="text-xs text-muted-foreground">
            Recent events (last 200 lines). Refresh to fetch the latest entries.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-slate-950 text-slate-100 shadow-sm">
        <div className="max-h-[360px] overflow-auto">
          {logs.length === 0 && !loading && (
            <div className="px-4 py-8 text-sm text-slate-400">
              No logs available for this service yet.
            </div>
          )}

          {logs.map((log, i) => (
            <div
              key={i}
              className="grid grid-cols-[auto,1fr] gap-4 border-b border-white/5 px-4 py-2 font-mono text-xs last:border-b-0"
            >
              <span className="text-amber-200/90 tabular-nums">{log.at}</span>
              <span className="whitespace-pre-wrap text-slate-100">{log.data}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
