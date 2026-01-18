import { Schema, model, models } from "mongoose";

export type Role = "admin" | "operator" | "viewer";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "operator", "viewer"],
      default: "viewer",
    },
    serviceScopes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
