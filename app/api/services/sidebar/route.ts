import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/service";
import { pm2JList } from "@/lib/pm2";

export async function GET() {
  await connectDB();

  const [services, pm2] = await Promise.all([
    Service.find({}, { name: 1, enabled: 1 }).sort({ name: 1 }),
    pm2JList(),
  ]);

  const pm2Map = new Map(pm2.map((p) => [p.name, p]));

  const result = services.map((s) => {
    const proc = pm2Map.get(s.name);
    return {
      name: s.name,
      enabled: s.enabled,
      status: proc?.pm2_env.status || "stopped",
    };
  });

  return NextResponse.json(result);
}
