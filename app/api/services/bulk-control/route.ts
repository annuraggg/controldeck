import { NextResponse } from "next/server";
import { exec } from "child_process";
import { getSettings } from "@/lib/settings";
import { ensureEcosystemFile } from "@/lib/ensureEcosystem";
import { requireApiAuth } from "@/lib/auth";
import { isServiceAllowed } from "@/lib/rbac";

function run(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

export async function POST(req: Request) {
  const auth = await requireApiAuth(req, { permission: "services:control" });
  if (auth.response) return auth.response;

  const settings = await getSettings();

  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { action, names } = body as {
    action?: string;
    names?: string[];
  };

  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json(
      { error: "No services selected" },
      { status: 400 }
    );
  }

  const unauthorized = names.find((name) => !isServiceAllowed(auth.user, name));
  if (unauthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!["start", "stop", "restart"].includes(action || "")) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "start") {
    ensureEcosystemFile(settings.ecosystemPath);
  }

  const results: Record<string, { success: boolean; output?: string }> = {};

  for (const name of names) {
    try {
      let output = "";
      if (action === "start") {
        output = await run(
          `pm2 start ${settings.ecosystemPath} --only ${name}`
        );
      } else {
        output = await run(`pm2 ${action} ${name}`);
      }
      results[name] = { success: true, output };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : (e as { toString?: () => string })?.toString?.() || "Unknown error";
      results[name] = { success: false, output: message };
    }
  }

  return NextResponse.json({ success: true, results });
}
