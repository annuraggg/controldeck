"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { MetricChart } from "./MetricChart";
import {
  useHistoricalMetrics,
  useMetricSampler,
  useSystemMetrics,
} from "./useSystemMetrics";
import { METRIC_SAMPLE_INTERVAL_MS } from "@/lib/systemMetrics";

const LIVE_REFRESH_INTERVAL = 10_000;
const LIVE_WINDOW_MS = 10_000;
const HISTORICAL_WINDOW_MS = 2 * 60 * 60 * 1000;
const HISTORICAL_HOURS = 2;

export default function SystemMonitorPage() {
  const [mode, setMode] = useState<"live" | "historical">("live");

  const liveData = useSystemMetrics(LIVE_REFRESH_INTERVAL, {
    enabled: mode === "live",
  });

  const {
    data: historicalData,
    loading: historicalLoading,
    error: historicalError,
    refresh: refreshHistorical,
  } = useHistoricalMetrics(HISTORICAL_HOURS, { enabled: mode === "historical" });

  useMetricSampler(METRIC_SAMPLE_INTERVAL_MS, mode === "historical");

  const showLive = mode === "live";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">System Monitor</h1>
          <p className="text-sm text-muted-foreground">
            {showLive
              ? "Live system performance (updates every 10s). Samples are stored every 30s while this page is open."
              : "Recent historical samples (last 2 hours, collected every 30s while this page is open)."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showLive ? "default" : "outline"}
            onClick={() => setMode("live")}
          >
            Live
          </Button>
          <Button
            size="sm"
            variant={!showLive ? "default" : "outline"}
            onClick={() => setMode("historical")}
          >
            Historical
          </Button>
          {!showLive && (
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshHistorical}
              disabled={historicalLoading}
            >
              {historicalLoading ? "Refreshing…" : "Refresh"}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {showLive ? (
        <div className="space-y-4">
          <MetricChart
            title="CPU Usage"
            data={liveData}
            dataKey="cpu"
            cssColorVar="--chart-1"
            unit="%"
            WINDOW_MS={LIVE_WINDOW_MS}
          />

          <MetricChart
            title="Memory Usage"
            data={liveData}
            dataKey="memory"
            cssColorVar="--chart-2"
            WINDOW_MS={LIVE_WINDOW_MS}
            unit="%"
          />

          <MetricChart
            title="Disk Usage"
            data={liveData}
            dataKey="disk"
            cssColorVar="--chart-3"
            WINDOW_MS={LIVE_WINDOW_MS}
            unit="%"
          />

          <MetricChart
            title="Network Traffic"
            data={liveData}
            dataKey="network"
            cssColorVar="--chart-4"
            WINDOW_MS={LIVE_WINDOW_MS}
            unit=" kb/s"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Showing last {HISTORICAL_HOURS} hours of CPU and memory samples. No
            polling; click Refresh to fetch the latest persisted readings.
          </div>

          {historicalError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {historicalError}
            </div>
          )}

          {historicalLoading && (
            <div className="rounded-md border border-muted px-4 py-6 text-sm text-muted-foreground">
              Loading historical data…
            </div>
          )}

          {!historicalLoading && historicalData.length === 0 && (
            <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              No historical data yet. Leave this page open to collect samples.
            </div>
          )}

          {historicalData.length > 0 && (
            <>
              <MetricChart
                title="CPU Usage"
                subtitle="Historical • last 2 hours"
                data={historicalData}
                dataKey="cpu"
                cssColorVar="--chart-1"
                unit="%"
                WINDOW_MS={HISTORICAL_WINDOW_MS}
                muted
              />

              <MetricChart
                title="Memory Usage"
                subtitle="Historical • last 2 hours"
                data={historicalData}
                dataKey="memory"
                cssColorVar="--chart-2"
                WINDOW_MS={HISTORICAL_WINDOW_MS}
                unit="%"
                muted
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
