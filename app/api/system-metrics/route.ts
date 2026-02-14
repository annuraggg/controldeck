export const runtime = "nodejs";

import si from "systeminformation";
import { requireApiAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req, { permission: "metrics:read" });
  if (auth.response) return auth.response;

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

  return Response.json(payload);
}
