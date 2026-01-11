"use client";

import { ServiceConfigEditor } from "@/components/service-config-editor";
import { ServiceLogs } from "@/components/service-logs";
import { use, useEffect, useState } from "react";

type RuntimeData = {
  status: string;
  pid: number;
  cpu: number;
  memory: number;
  restarts: number;
  uptimeMs: number;
  interpreter: string;
};

type DesiredData = {
  kind: string;
  port?: number;
  cwd: string;
  script: string;
  args?: string;
  env?: Record<string, string>;
  enabled?: boolean;
};

type ServiceData = {
  name: string;
  managed: boolean;
  enabled: boolean;
  desired: DesiredData | null;
  runtime: RuntimeData | null;
  readOnly: boolean;
};

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function ServicePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const [data, setData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { name } = use(params);

  const [busy, setBusy] = useState(false);

  async function control(action: "start" | "stop" | "restart") {
    setBusy(true);

    await fetch(`/api/services/${name}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    // Re-fetch service data
    const res = await fetch(`/api/services/${name}`);
    const d = await res.json();
    setData(d);

    setBusy(false);
  }

  useEffect(() => {
    fetch(`/api/services/${name}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [name]);

  if (loading) return <div>Loading…</div>;
  if (!data) return <div>Service not found</div>;

  const { runtime, desired } = data;
  const readOnly = data.readOnly;

  return (
    <div className="max-w-5xl space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="text-sm text-muted-foreground">
          {runtime ? `Status: ${runtime.status}` : "Not running"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={busy || !!runtime || readOnly}
          onClick={() => control("start")}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Start
        </button>

        <button
          disabled={busy || !runtime}
          onClick={() => control("restart")}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Restart
        </button>

        <button
          disabled={busy || !runtime || readOnly}
          onClick={() => control("stop")}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Stop
        </button>

        {readOnly && (
          <span className="text-xs text-yellow-700">
            Actions are disabled in read-only mode.
          </span>
        )}
      </div>

      {/* Runtime section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Runtime</h2>

        {runtime ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">PID</span>
              <div>{runtime.pid}</div>
            </div>
            <div>
              <span className="text-muted-foreground">CPU</span>
              <div>{runtime.cpu}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Memory</span>
              <div>{(runtime.memory / 1024 / 1024).toFixed(1)} MB</div>
            </div>
            <div>
              <span className="text-muted-foreground">Restarts</span>
              <div>{runtime.restarts}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Uptime</span>
              <div>{formatUptime(runtime.uptimeMs)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Interpreter</span>
              <div>{runtime.interpreter}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            PM2 is not running this service.
          </p>
        )}
      </section>

      {/* Configured section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Configured</h2>

        {desired ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type</span>
              <div>{desired.kind}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Port</span>
              <div>{desired.port ?? "—"}</div>
            </div>
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Working directory</span>
              <div className="break-all">{desired.cwd}</div>
            </div>
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Script</span>
              <div className="break-all">{desired.script}</div>
            </div>
            {desired.args && (
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Args</span>
                <div className="break-all">{desired.args}</div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This service is not managed by ControlDeck.
          </p>
        )}
      </section>

      <ServiceLogs name={name} />
       {desired && (
         <ServiceConfigEditor
           key={JSON.stringify(desired)}
           serviceName={name}
           service={desired}
           readOnly={readOnly}
           onSaved={(updated) => {
             setData((d) => (d ? { ...d, desired: updated } : d));
           }}
         />
       )}
    </div>
  );
}
