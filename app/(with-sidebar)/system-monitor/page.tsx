"use client";

import { MetricChart } from "./MetricChart";
import { useSystemMetrics } from "./useSystemMetrics";

const REFRESH_INTERVAL = 10000;
const WINDOW_MS = 10_000;

export default function SystemMonitorPage() {
  const data = useSystemMetrics(REFRESH_INTERVAL);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">System Monitor</h1>
        <p className="text-sm text-muted-foreground">Live system performance</p>
      </div>

      <MetricChart
        title="CPU Usage"
        data={data}
        dataKey="cpu"
        cssColorVar="--chart-1"
        unit="%"
        WINDOW_MS={WINDOW_MS}
      />

      <MetricChart
        title="Memory Usage"
        data={data}
        dataKey="memory"
        cssColorVar="--chart-2"
        WINDOW_MS={WINDOW_MS}
        unit="%"
      />

      <MetricChart
        title="Disk Usage"
        data={data}
        dataKey="disk"
        cssColorVar="--chart-3"
        WINDOW_MS={WINDOW_MS}
        unit="%"
      />

      <MetricChart
        title="Network Traffic"
        data={data}
        dataKey="network"
        cssColorVar="--chart-4"
        WINDOW_MS={WINDOW_MS}
        unit=" kb/s"
      />
    </div>
  );
}
