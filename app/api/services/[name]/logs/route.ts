import { NextResponse } from "next/server";
import { exec } from "child_process";

function run(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  const { searchParams } = new URL(req.url);
  const lines = searchParams.get("lines") || "200";

  try {
    const output = await run(`pm2 logs ${params.name} --lines ${lines} --json`);

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
