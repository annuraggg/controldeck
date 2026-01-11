import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/settings";
import { hashServices } from "@/lib/hashService";

export async function GET() {
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
