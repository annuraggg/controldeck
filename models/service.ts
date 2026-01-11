import { Schema, model, models } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    kind: {
      type: String,
      enum: ["node", "static", "python"],
      required: true,
    },

    cwd: {
      type: String,
      required: true,
    },

    script: {
      type: String,
      required: true,
    },

    args: {
      type: String,
    },

    interpreter: {
      type: String,
    },

    env: {
      type: Map,
      of: String,
      default: {},
    },

    port: {
      type: Number,
    },

    exec_mode: {
      type: String,
      enum: ["fork", "cluster"],
      default: "fork",
    },

    watch: {
      type: Boolean,
      default: false,
    },

    autorestart: {
      type: Boolean,
      default: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default models.Service || model("Service", ServiceSchema);
