import si from "systeminformation";
import { connectDB } from "./mongodb";
import SystemMetric from "@/models/systemMetric";
import { METRIC_SAMPLE_INTERVAL_MS } from "./systemMetrics";

const globalWithCron = global as typeof globalThis & {
  __metricCronStarted?: boolean;
};

async function recordSample() {
  try {
    const [cpu, mem] = await Promise.all([si.currentLoad(), si.mem()]);

    await connectDB();
    await SystemMetric.create({
      timestamp: new Date(),
      cpu: cpu.currentLoad,
      memory: (mem.used / mem.total) * 100,
    });
  } catch (err) {
    console.error("Failed to record system metrics sample", err);
  }
}

export function ensureMetricCron() {
  if (globalWithCron.__metricCronStarted) return;
  globalWithCron.__metricCronStarted = true;

  recordSample();
  const timer = setInterval(recordSample, METRIC_SAMPLE_INTERVAL_MS);
  if (typeof timer === "object" && "unref" in timer && typeof timer.unref === "function") {
    timer.unref();
  }
}
