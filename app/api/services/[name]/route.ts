import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/service";
import { pm2JList } from "@/lib/pm2";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  await connectDB();

  const name = (await params).name;

  const service = await Service.findOne({ name });
  const pm2 = await pm2JList();
  const proc = pm2.find((p) => p.name === name);
  return NextResponse.json({
    name: name,
    managed: !!service,
    enabled: service?.enabled ?? false,

    desired: service
      ? {
          kind: service.kind,
          cwd: service.cwd,
          script: service.script,
          args: service.args,
          env: Object.fromEntries(service.env || []),
          port: service.port,
        }
      : null,

    runtime: proc
      ? {
          status: proc.pm2_env.status,
          pid: proc.pid,
          cpu: proc.monit.cpu,
          memory: proc.monit.memory,
          restarts: proc.pm2_env.restart_time,
          uptimeMs: Date.now() - proc.pm2_env.pm_uptime,
          interpreter: proc.pm2_env.exec_interpreter,
        }
      : null,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { name: string } }
) {
  await connectDB();
  const body = await req.json();

  const service = await Service.findOne({ name: params.name });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Allow only safe fields
  const fields = ["cwd", "script", "args", "port", "env", "enabled"];

  for (const f of fields) {
    if (body[f] !== undefined) {
      service[f] = body[f];
    }
  }

  await service.save();
  return NextResponse.json(service);
}
