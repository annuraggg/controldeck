import { NextResponse } from "next/server";
import { exec } from "child_process";
import { getSettings } from "@/lib/settings";
import { ensureEcosystemFile } from "@/lib/ensureEcosystem";
import { generateEcosystem } from "@/lib/generateEcosystem";
import { hashServices } from "@/lib/hashService";
import { requireApiAuth } from "@/lib/auth";

function run(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

export async function POST(req: Request) {
  const auth = await requireApiAuth(req, { permission: "pm2:apply" });
  if (auth.response) return auth.response;

  const settings = await getSettings();
  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  ensureEcosystemFile(settings.ecosystemPath);
  await generateEcosystem(settings.ecosystemPath);

  const output = await run(`pm2 reload ${settings.ecosystemPath}`);

  settings.lastAppliedHash = await hashServices();
  await settings.save();

  return NextResponse.json({
    success: true,
    output,
  });
}
