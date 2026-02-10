import { Schema, Types, model, models } from "mongoose";

const SessionSchema = new Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export default models.Session || model("Session", SessionSchema);
