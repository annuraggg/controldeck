import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const settings = await getSettings();

   const canWrite = !settings.readOnly || body.readOnly === false;

   if (!canWrite) {
     return NextResponse.json(
       { error: "Read-only mode enabled" },
       { status: 403 }
     );
   }

   if (body.ecosystemPath && !settings.readOnly) {
     settings.ecosystemPath = body.ecosystemPath.trim();
   }

   if (body.readOnly !== undefined) {
     settings.readOnly = !!body.readOnly;
   }

   await settings.save();

   return NextResponse.json(settings);
}
