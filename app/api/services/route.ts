import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/service";
import { getSettings } from "@/lib/settings";

export async function GET() {
  await connectDB();
  const services = await Service.find().sort({ name: 1 });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  await connectDB();
  const settings = await getSettings();

  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  const body = await req.json();

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
