import { NextResponse } from "next/server";
import { pm2JList } from "@/lib/pm2";

export async function GET() {
  try {
    const list = await pm2JList();

    const services = list.map((p) => ({
      name: p.name,
      pm_id: p.pm_id,
      status: p.pm2_env.status,
      pid: p.pid,
      restarts: p.pm2_env.restart_time,
      cpu: p.monit.cpu,
      memory: p.monit.memory,
      uptime: Date.now() - p.pm2_env.pm_uptime,
    }));

    return NextResponse.json(services);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
