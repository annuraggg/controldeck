import si from "systeminformation";

export async function GET() {
  const [cpu, mem, fs, net] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
  ]);

  return Response.json({
    ts: Date.now(),

    cpu: cpu.currentLoad,
    memory: (mem.used / mem.total) * 100,

    disk: fs[0]?.use ?? 0,

    network: net[0] ? (net[0].rx_sec + net[0].tx_sec) / 1024 : 0,
  });
}
