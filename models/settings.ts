import { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema({
  pm2ReloadCommand: {
    type: String,
    default: "pm2 reload ecosystem.config.js",
  },

  lastAppliedHash: {
    type: String,
    default: null,
  },

  ecosystemPath: {
    type: String,
    default: "/home/apsit/ecosystem.config.js",
  },

  serveBinary: {
    type: String,
    default: "serve",
  },
});

export default models.Settings || model("Settings", SettingsSchema);
