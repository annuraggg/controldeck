import { useCallback, useEffect, useState } from "react";

export type MetricPoint = {
  ts: number;
  cpu: number;
  memory: number;
  disk?: number;
  network?: number;
};

const MAX_POINTS = 60;

export function useSystemMetrics(
  refreshInterval: number,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<MetricPoint[]>([]);

  useEffect(() => {
    if (!enabled) return;

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
  }, [refreshInterval, enabled]);

  return data;
}

export function useHistoricalMetrics(hours: number, options?: { enabled?: boolean }) {
  const [data, setData] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = options?.enabled ?? true;

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/system-metrics/history?hours=${hours}`);
      if (!res.ok) {
        throw new Error("Failed to load historical metrics");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, hours]);

  useEffect(() => {
    if (!enabled) return;
    load();
  }, [hours, enabled, load]);

  return { data, loading, error, refresh: load };
}

export function useMetricSampler(intervalMs: number, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const collect = async () => {
      try {
        await fetch("/api/system-metrics");
      } catch {
        // ignore sampling errors
      }
    };

    collect();
    const id = setInterval(() => {
      if (!cancelled) {
        collect();
      }
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}
