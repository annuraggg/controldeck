import Service from "@/models/service";
import { sha256Hex } from "./cryptoUtils";

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

  return sha256Hex(JSON.stringify(normalized));
}
