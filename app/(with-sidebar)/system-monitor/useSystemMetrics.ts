import { useEffect, useState } from "react";

export type MetricPoint = {
  ts: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
};

const MAX_POINTS = 60;

export function useSystemMetrics(refreshInterval: number) {
  const [data, setData] = useState<MetricPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchMetrics = async () => {
      const res = await fetch("/api/system-metrics");
      const json = await res.json();

      if (!cancelled) {
        setData((prev) => [...prev, json].slice(-MAX_POINTS));
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return data;
}
