import si from "systeminformation";
import { connectDB } from "@/lib/mongodb";
import SystemMetric from "@/models/systemMetric";

const SAMPLE_INTERVAL_MS = 30_000;

export async function GET() {
  const now = Date.now();

  const [cpu, mem, fs, net] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
  ]);

  const payload = {
    ts: now,
    cpu: cpu.currentLoad,
    memory: (mem.used / mem.total) * 100,
    disk: fs[0]?.use ?? 0,
    network: net[0] ? (net[0].rx_sec + net[0].tx_sec) / 1024 : 0,
  };

  try {
    await connectDB();
    const lastSample = await SystemMetric.findOne()
      .sort({ timestamp: -1 })
      .select("timestamp")
      .lean();

    if (!lastSample || now - lastSample.timestamp.getTime() >= SAMPLE_INTERVAL_MS) {
      await SystemMetric.create({
        timestamp: new Date(now),
        cpu: payload.cpu,
        memory: payload.memory,
      });
    }
  } catch (err) {
    console.error("Failed to record system metric sample", err);
  }

  return Response.json(payload);
}
