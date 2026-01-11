import { NextResponse } from "next/server";
import { pm2JList } from "@/lib/pm2";

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  const list = await pm2JList();
  const proc = list.find((p) => p.name === params.name);

  if (!proc) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: proc.name,
    status: proc.pm2_env.status,
    cwd: proc.pm2_env.pm_cwd,
    script: proc.pm2_env.pm_exec_path,
    args: proc.pm2_env.args,
    env: proc.pm2_env.env,
    cpu: proc.monit.cpu,
    memory: proc.monit.memory,
    uptime: Date.now() - proc.pm2_env.pm_uptime,
    restarts: proc.pm2_env.restart_time,
    node_version: proc.pm2_env.node_version,
    interpreter: proc.pm2_env.exec_interpreter,
  });
}
