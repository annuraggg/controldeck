import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import { pm2JList } from "@/lib/pm2";

export async function GET() {
  await connectDB();

  const [services, pm2] = await Promise.all([Service.find(), pm2JList()]);

  const pm2Map = new Map(pm2.map((p) => [p.name, p]));

  const merged = services.map((s) => {
    const p = pm2Map.get(s.name);

    return {
      name: s.name,
      enabled: s.enabled,
      desiredPort: s.port,
      status: p?.pm2_env.status || "stopped",
      cpu: p?.monit.cpu ?? 0,
      memory: p?.monit.memory ?? 0,
      drift: s.enabled && !p,
    };
  });

  return NextResponse.json(merged);
}
