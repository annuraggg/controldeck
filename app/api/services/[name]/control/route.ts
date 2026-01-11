import { NextResponse } from "next/server";
import { exec } from "child_process";
import { getSettings } from "@/lib/settings";
import { ensureEcosystemFile } from "@/lib/ensureEcosystem";

function run(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const settings = await getSettings();
  ensureEcosystemFile(settings.ecosystemPath);

  const { action } = await req.json();
  const name = (await params).name;

  if (!["start", "stop", "restart"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    let output = "";

    if (action === "start") {
      output = await run(`pm2 start ecosystem.config.js --only ${name}`);
    } else {
      output = await run(`pm2 ${action} ${name}`);
    }

    return NextResponse.json({ success: true, output });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: e.toString() },
      { status: 500 }
    );
  }
}
