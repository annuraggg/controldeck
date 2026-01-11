import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const settings = await getSettings();

  if (body.ecosystemPath) {
    settings.ecosystemPath = body.ecosystemPath.trim();
    await settings.save();
  }

  return NextResponse.json(settings);
}
