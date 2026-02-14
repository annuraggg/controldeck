export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/settings";
import { hashServices } from "@/lib/hashService";
import { requireApiAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req, { permission: "settings:read" });
  if (auth.response) return auth.response;

  await connectDB();

  const settings = await Settings.findOne();
  const currentHash = await hashServices();

  const drifted =
    !settings?.lastAppliedHash || settings.lastAppliedHash !== currentHash;

  return NextResponse.json({
    drifted,
    lastAppliedHash: settings?.lastAppliedHash,
    currentHash,
  });
}
