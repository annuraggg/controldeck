import fs from "fs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/service";
import { getSettings } from "@/lib/settings";

export async function GET() {
  await connectDB();
  const settings = await getSettings();

  const services = await Service.find().sort({ name: 1 }).lean();

  let ecosystem: string | null = null;
  try {
    ecosystem = fs.readFileSync(settings.ecosystemPath, "utf-8");
  } catch {
    ecosystem = null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return NextResponse.json({
    timestamp,
    services,
    ecosystem,
    ecosystemPath: settings.ecosystemPath,
  });
}
