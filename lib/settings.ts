import Settings from "@/models/settings";
import { connectDB } from "@/lib/mongodb";

export async function getSettings() {
  await connectDB();

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      ecosystemPath: "/home/apsit/ecosystem.config.js",
    });
  }

  return settings;
}
