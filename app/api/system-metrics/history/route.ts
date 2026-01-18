import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemMetric from "@/models/systemMetric";

const DEFAULT_HOURS = 2;
const MAX_HOURS = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hoursParam = Number(searchParams.get("hours"));

  const hours =
    Number.isFinite(hoursParam) && hoursParam > 0
      ? Math.min(hoursParam, MAX_HOURS)
      : DEFAULT_HOURS;

  try {
    await connectDB();

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const expectedSamples = Math.min(
      Math.ceil((hours * 60 * 60 * 1000) / 30_000) + 5,
      300
    );

    const metrics = await SystemMetric.find({ timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .limit(expectedSamples)
      .lean();

    return NextResponse.json(
      metrics.map((m) => ({
        ts: m.timestamp.getTime(),
        cpu: m.cpu,
        memory: m.memory,
      }))
    );
  } catch (err) {
    console.error("Failed to read historical metrics", err);
    return NextResponse.json([], { status: 200 });
  }
}
