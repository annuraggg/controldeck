import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { requireApiAuth } from "@/lib/auth";
import { isValidServiceName } from "@/lib/validation";

const MAX_LOG_LINES = 5000;

function run(args: string[]) {
  return new Promise<string>((resolve, reject) => {
    execFile(
      "pm2",
      args,
      { maxBuffer: 1024 * 1024 * 5 },
      (err, stdout, stderr) => {
        if (err) reject(stderr || err.message);
        else resolve(stdout);
      }
    );
  });
}

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  const auth = await requireApiAuth(req, {
    permission: "services:logs",
    serviceName: params.name,
  });
  if (auth.response) return auth.response;

  if (!isValidServiceName(params.name)) {
    return NextResponse.json({ error: "Invalid service name" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const lines = searchParams.get("lines") || "200";
  const parsedLines = Number.parseInt(lines, 10);
  if (!Number.isFinite(parsedLines) || parsedLines <= 0 || parsedLines > MAX_LOG_LINES) {
    return NextResponse.json(
      { error: `Lines must be a positive number up to ${MAX_LOG_LINES}` },
      { status: 400 }
    );
  }

  try {
    const output = await run([
      "logs",
      params.name,
      "--lines",
      String(parsedLines),
      "--json",
    ]);

    // PM2 outputs JSON lines, not an array
    const logs = output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ logs });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
