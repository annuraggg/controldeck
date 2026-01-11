"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type LogSchema = {
  at: string;
  data: string;
};

export function ServiceLogs({ name }: { name: string }) {
  const [logs, setLogs] = useState<LogSchema[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/services/${name}/logs?lines=200`);
    const data = await res.json();
    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Logs</h2>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      <div className="rounded-md border bg-black text-white text-xs font-mono p-3 max-h-100 overflow-auto">
        {logs.length === 0 && (
          <div className="text-muted-foreground">No logs available.</div>
        )}

        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap">
            <span className="text-green-400">{log.at}</span> {log.data}
          </div>
        ))}
      </div>
    </section>
  );
}
