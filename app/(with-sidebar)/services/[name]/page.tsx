"use client";

import { ServiceConfigEditor } from "@/components/service-config-editor";
import { ServiceLogs } from "@/components/service-logs";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Play, RotateCcw, Square } from "lucide-react";

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

type Tone = "ok" | "warn" | "muted";

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

  const statusPill = (label: string, tone: Tone) => {
    const tones: Record<Tone, string> = {
      ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warn: "bg-amber-50 text-amber-800 border-amber-200",
      muted: "bg-muted text-muted-foreground border-border",
    };
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            tone === "ok"
              ? "bg-emerald-500/90"
              : tone === "warn"
              ? "bg-amber-500/90"
              : "bg-muted-foreground/60"
          }`}
        />
        {label}
      </span>
    );
  };

  const startDisabledReason = readOnly
    ? "Read-only mode: runtime controls are disabled."
    : runtime
    ? "Service is already running."
    : busy
    ? "Action in progress."
    : "";

  const restartDisabledReason = readOnly
    ? "Read-only mode: runtime controls are disabled."
    : !runtime
    ? "Start the service before restarting it."
    : busy
    ? "Action in progress."
    : "";

  const stopDisabledReason = readOnly
    ? "Read-only mode: runtime controls are disabled."
    : !runtime
    ? "Service is not running."
    : busy
    ? "Action in progress."
    : "";

  return (
    <div className="space-y-8">
      <div className="space-y-3 rounded-xl border bg-background px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tenant service
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold leading-tight">{data.name}</h1>
              {runtime
                ? statusPill(runtime.status, runtime.status === "online" ? "ok" : "warn")
                : statusPill("Not running", "warn")}
              {desired
                ? statusPill(desired.enabled === false ? "Disabled in config" : "Managed", "muted")
                : statusPill("Not managed", "muted")}
            </div>
            <p className="text-sm text-muted-foreground">
              {runtime
                ? `PM2 reports this service as ${runtime.status}.`
                : "Service is currently stopped. Runtime controls remain available."}
            </p>
          </div>
          {readOnly && statusPill("Read-only mode", "warn")}
        </div>
      </div>

      <section className="space-y-4 rounded-xl border bg-muted/30 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Runtime controls</h2>
            <p className="text-xs text-muted-foreground">
              Actions target the PM2 runtime only. Applying configuration remains manual.
            </p>
          </div>
          {busy && <span className="text-xs text-muted-foreground">Working…</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={() => control("start")}
                  disabled={busy || !!runtime || readOnly}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Play className="h-4 w-4" />
                  Start runtime
                </Button>
              </span>
            </TooltipTrigger>
            {startDisabledReason && <TooltipContent>{startDisabledReason}</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="secondary"
                  onClick={() => control("restart")}
                  disabled={busy || !runtime}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
              </span>
            </TooltipTrigger>
            {restartDisabledReason && <TooltipContent>{restartDisabledReason}</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="destructive"
                  onClick={() => control("stop")}
                  disabled={busy || !runtime || readOnly}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </span>
            </TooltipTrigger>
            {stopDisabledReason && <TooltipContent>{stopDisabledReason}</TooltipContent>}
          </Tooltip>
        </div>

        {readOnly && (
          <p className="text-xs text-amber-800">
            Read-only mode keeps controls visible but disables state-changing actions.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border bg-background px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Runtime</h2>
            {runtime
              ? statusPill(runtime.status, runtime.status === "online" ? "ok" : "warn")
              : statusPill("Not running", "warn")}
          </div>

          {runtime ? (
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div>
                <span className="text-muted-foreground">PID</span>
                <div className="font-semibold">{runtime.pid}</div>
              </div>
              <div>
                <span className="text-muted-foreground">CPU</span>
                <div className="font-semibold">{runtime.cpu}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Memory</span>
                <div className="font-semibold">
                  {(runtime.memory / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Restarts</span>
                <div className="font-semibold">{runtime.restarts}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Uptime</span>
                <div className="font-semibold">{formatUptime(runtime.uptimeMs)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Interpreter</span>
                <div className="font-semibold">{runtime.interpreter}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
              Service is not running. Start the service to collect runtime telemetry.
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-xl border bg-background px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Desired configuration</h2>
            {desired
              ? statusPill("Stored in MongoDB", "muted")
              : statusPill("Not managed by ControlDeck", "warn")}
          </div>

          {desired ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <div className="font-semibold">{desired.kind}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Port</span>
                  <div className="font-semibold">{desired.port ?? "—"}</div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Working directory</span>
                  <div className="break-all font-semibold">{desired.cwd}</div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Script</span>
                  <div className="break-all font-semibold">{desired.script}</div>
                </div>
                {desired.args && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Args</span>
                    <div className="break-all font-semibold">{desired.args}</div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
                Config changes do not auto-apply. Use “Apply & reload PM2” when you&apos;re ready
                to push intent to runtime.
              </div>

              <Separator />

              <ServiceConfigEditor
                key={JSON.stringify(desired)}
                serviceName={name}
                service={desired}
                readOnly={readOnly}
                onSaved={(updated) => {
                  setData((d) => (d ? { ...d, desired: updated } : d));
                }}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              This service is not managed by ControlDeck. Add a configuration to bring it under
              intent tracking.
            </div>
          )}
        </section>
      </div>

      <ServiceLogs name={name} />
    </div>
  );
}
