import { Schema, model, models } from "mongoose";
import { METRIC_TTL_SECONDS } from "@/lib/systemMetrics";

const SystemMetricSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    expires: METRIC_TTL_SECONDS, // 24 hours
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
