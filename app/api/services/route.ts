import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/service";
import { getSettings } from "@/lib/settings";
import { requireApiAuth } from "@/lib/auth";
import { isServiceAllowed } from "@/lib/rbac";
import { isValidServiceName } from "@/lib/validation";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req, { permission: "services:read" });
  if (auth.response) return auth.response;

  await connectDB();
  const query =
    auth.user.serviceScopes.length > 0
      ? { name: { $in: auth.user.serviceScopes } }
      : {};
  const services = await Service.find(query).sort({ name: 1 });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const auth = await requireApiAuth(req, { permission: "services:write" });
  if (auth.response) return auth.response;

  await connectDB();
  const settings = await getSettings();

  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  const body = await req.json();
  if (!isValidServiceName(body.name)) {
    return NextResponse.json(
      { error: "Service name must contain only letters, numbers, dot, underscore or dash" },
      { status: 400 }
    );
  }
  if (!isServiceAllowed(auth.user, body.name)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const enabled = body.enabled !== undefined ? !!body.enabled : true;
  const port =
    body.port === undefined || body.port === null || body.port === ""
      ? undefined
      : Number(body.port);

  if (port !== undefined && Number.isNaN(port)) {
    return NextResponse.json(
      { error: "Port must be a number" },
      { status: 400 }
    );
  }

  if (enabled && port !== undefined) {
    const collision = await Service.findOne({ port, enabled: true });
    if (collision) {
      return NextResponse.json(
        {
          error: `Port ${port} is already used by service '${collision.name}'`,
        },
        { status: 400 }
      );
    }
  }

  const service = await Service.create({
    ...body,
    port,
  });
  return NextResponse.json(service);
}
