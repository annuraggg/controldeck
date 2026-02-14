export const runtime = "nodejs";

import path from "path";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { requireApiAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req, { permission: "settings:read" });
  if (auth.response) return auth.response;

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const auth = await requireApiAuth(req, { permission: "settings:write" });
  if (auth.response) return auth.response;

  const body = await req.json();
  const settings = await getSettings();
  const nextPath =
    typeof body.ecosystemPath === "string"
      ? body.ecosystemPath.trim()
      : undefined;

  const canWrite = !settings.readOnly || body.readOnly === false;

  if (!canWrite) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  if (nextPath && !path.isAbsolute(nextPath)) {
    return NextResponse.json(
      { error: "Path must be an absolute filesystem path" },
      { status: 400 }
    );
  }

  if (nextPath && !settings.readOnly) {
    settings.ecosystemPath = nextPath;
  }

  if (body.readOnly !== undefined) {
    settings.readOnly = !!body.readOnly;
  }

  await settings.save();

  return NextResponse.json(settings);
}
