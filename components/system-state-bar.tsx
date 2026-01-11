"use client";

import { useEffect, useState } from "react";
import { Radio, ShieldAlert, ShieldCheck } from "lucide-react";

import { useSettings } from "@/hooks/useSettings";

type DriftState = "checking" | "clean" | "drifted";

export function SystemStateBar() {
  const { settings } = useSettings();
  const readOnly = settings?.readOnly;
  const [drift, setDrift] = useState<DriftState>("checking");

  useEffect(() => {
    fetch("/api/drift")
      .then((res) => res.json())
      .then((payload) => setDrift(payload.drifted ? "drifted" : "clean"))
      .catch(() => setDrift("checking"));
  }, []);

  const serverLabel = process.env.NEXT_PUBLIC_SERVER_NAME || "ControlDeck";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-background/90 px-5 py-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Control plane
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-semibold leading-tight">{serverLabel}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
            Manual actions only
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Intent lives in MongoDB. PM2 runtime changes remain explicit and deliberate.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-muted/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs">
            {drift === "checking"
              ? "Checking drift…"
              : drift === "drifted"
              ? "Apply pending"
              : "In sync"}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
            readOnly
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {readOnly ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          <span>{readOnly ? "Read-only enforced" : "Mutations allowed"}</span>
        </div>
      </div>
    </div>
  );
}
