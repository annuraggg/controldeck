import { NextResponse } from "next/server";
import { pm2JList } from "@/lib/pm2";
import { requireApiAuth } from "@/lib/auth";
import { isServiceAllowed } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req, { permission: "services:read" });
  if (auth.response) return auth.response;

  try {
    const list = await pm2JList();

    const services = list
      .filter((p) => isServiceAllowed(auth.user, p.name))
      .map((p) => ({
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
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
