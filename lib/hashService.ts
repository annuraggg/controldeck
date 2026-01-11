import crypto from "crypto";
import Service from "@/models/service";

export async function hashServices() {
  const services = await Service.find({ enabled: true })
    .sort({ name: 1 })
    .lean();

  const normalized = services.map(s => ({
    name: s.name,
    cwd: s.cwd,
    script: s.script,
    args: s.args,
    interpreter: s.interpreter,
    env: s.env,
    port: s.port,
    exec_mode: s.exec_mode,
    watch: s.watch,
    autorestart: s.autorestart,
  }));

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}
