import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/service";
import { pm2JList } from "@/lib/pm2";
import { getSettings } from "@/lib/settings";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  await connectDB();
  const settings = await getSettings();

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
    readOnly: settings.readOnly,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { name: string } }
) {
  await connectDB();
  const body = await req.json();
  const settings = await getSettings();

  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  const service = await Service.findOne({ name: params.name });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const desiredEnabled =
    body.enabled !== undefined ? !!body.enabled : service.enabled;
  const desiredPortRaw =
    body.port !== undefined ? body.port : service.port ?? undefined;
  const desiredPort =
    desiredPortRaw === undefined ||
    desiredPortRaw === null ||
    desiredPortRaw === ""
      ? undefined
      : Number(desiredPortRaw);

  if (desiredPort !== undefined && Number.isNaN(desiredPort)) {
    return NextResponse.json(
      { error: "Port must be a number" },
      { status: 400 }
    );
  }

  if (desiredEnabled && desiredPort !== undefined) {
    const collision = await Service.findOne({
      name: { $ne: service.name },
      port: desiredPort,
      enabled: true,
    });

    if (collision) {
      return NextResponse.json(
        {
          error: `Port ${desiredPort} is already used by service '${collision.name}'`,
        },
        { status: 400 }
      );
    }
  }

  // Allow only safe fields
  const fields = ["cwd", "script", "args", "env"];

  for (const f of fields) {
    if (body[f] !== undefined) {
      service[f] = body[f];
    }
  }

  if (body.port !== undefined) {
    service.port = desiredPort;
  }

  if (body.enabled !== undefined) {
    service.enabled = desiredEnabled;
  }

  await service.save();
  return NextResponse.json(service);
}
