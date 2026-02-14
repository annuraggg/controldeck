import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { getSettings } from "@/lib/settings";
import { ensureEcosystemFile } from "@/lib/ensureEcosystem";
import { requireApiAuth } from "@/lib/auth";
import { isValidServiceName } from "@/lib/validation";

function run(args: string[]) {
  return new Promise<string>((resolve, reject) => {
    execFile("pm2", args, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const name = (await params).name;
  if (!isValidServiceName(name)) {
    return NextResponse.json({ error: "Invalid service name" }, { status: 400 });
  }
  const auth = await requireApiAuth(req, {
    permission: "services:control",
    serviceName: name,
  });
  if (auth.response) return auth.response;

  const settings = await getSettings();
  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  ensureEcosystemFile(settings.ecosystemPath);

  const { action } = await req.json();

  if (!["start", "stop", "restart"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    let output = "";

    if (action === "start") {
      output = await run(["start", settings.ecosystemPath, "--only", name]);
    } else {
      output = await run([action, name]);
    }

    return NextResponse.json({ success: true, output });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
