import { Schema, model, models } from "mongoose";

const SystemMetricSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, // 24 hours
    index: true,
  },
  cpu: {
    type: Number,
    required: true,
  },
  memory: {
    type: Number,
    required: true,
  },
});

export default models.SystemMetric || model("SystemMetric", SystemMetricSchema);
