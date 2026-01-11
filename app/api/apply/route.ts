import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { ensureEcosystemFile } from "@/lib/ensureEcosystem";
import { generateEcosystem } from "@/lib/generateEcosystem";
import { hashServices } from "@/lib/hashService";

export async function POST() {
  const settings = await getSettings();
  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }
  const hash = await hashServices();
  settings.lastAppliedHash = hash;

  console.log("Applying changes, new hash:", hash, settings);
  await settings.save();

  ensureEcosystemFile(settings.ecosystemPath);
  await generateEcosystem(settings.ecosystemPath);

  return NextResponse.json({
    success: true,
    ecosystemPath: settings.ecosystemPath,
  });
}
